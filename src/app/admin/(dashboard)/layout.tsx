import { signOut } from "@/app/admin/_actions/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";
import { adminGetUnreadCount } from "@/lib/admin/queries";

/** Admin data is never cached — an editor must always see the current state. */
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Server-side gate. The proxy redirects too, but this is the authoritative check.
  const user = await requireAdmin();
  const unreadCount = await adminGetUnreadCount();

  return (
    <AdminShell
      email={user.email ?? "Signed in"}
      unreadCount={unreadCount}
      signOutAction={signOut}
    >
      {children}
    </AdminShell>
  );
}
