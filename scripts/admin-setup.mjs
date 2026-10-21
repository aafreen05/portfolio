/**
 * Creates (or updates) the admin login and puts it on the admin allowlist.
 *
 *   npm run admin:setup
 *
 * Reads .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   ADMIN_EMAIL, ADMIN_PASSWORD
 *
 * Safe to run again: an existing account gets its password reset to
 * ADMIN_PASSWORD (handy if it is ever forgotten) and stays on the allowlist.
 * Run supabase/setup.sql in the Supabase SQL Editor first.
 */
import { createClient } from "@supabase/supabase-js";

const required = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "ADMIN_EMAIL", "ADMIN_PASSWORD"];
const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  console.error(`✗ Missing from .env.local: ${missing.join(", ")}`);
  process.exit(1);
}

const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 1. The allowlist table comes from supabase/setup.sql.
const { error: tableError } = await supabase.from("admin_users").select("user_id").limit(1);
if (tableError) {
  console.error("✗ The database is not set up yet: run supabase/setup.sql in the Supabase SQL Editor, then try again.");
  console.error(`  (${tableError.message})`);
  process.exit(1);
}

// 2. Find the account, or create it.
async function findUser(address) {
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === address);
    if (match) return match;
    if (data.users.length < 200) return null;
  }
}

let user = await findUser(email);

if (user) {
  const { error } = await supabase.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  if (error) {
    console.error(`✗ Could not update ${email}: ${error.message}`);
    process.exit(1);
  }
  console.log(`✓ Found ${email} — password set from ADMIN_PASSWORD.`);
} else {
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) {
    console.error(`✗ Could not create ${email}: ${error.message}`);
    process.exit(1);
  }
  user = data.user;
  console.log(`✓ Created the admin account ${email}.`);
}

// 3. Allowlist it.
const { error: allowError } = await supabase
  .from("admin_users")
  .upsert({ user_id: user.id, email }, { onConflict: "user_id" });
if (allowError) {
  console.error(`✗ Could not add ${email} to the admin allowlist: ${allowError.message}`);
  process.exit(1);
}

console.log(`✓ ${email} is on the admin allowlist.`);
console.log("  Sign in at /admin/login with ADMIN_EMAIL and ADMIN_PASSWORD.");
