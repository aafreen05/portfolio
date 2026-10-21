"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations";

const NOT_ADMIN_MESSAGE =
  "This account is not on the admin allowlist, so it cannot open the admin panel. If it is your admin account, run “npm run admin:setup” once.";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Arriving with ?error=not-admin means the proxy just signed out an account
  // that is not an administrator.
  const [serverError, setServerError] = React.useState<string | null>(
    searchParams.get("error") === "not-admin" ? NOT_ADMIN_MESSAGE : null,
  );
  const [pending, setPending] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    setPending(true);

    const supabase = createClient();
    if (!supabase) {
      setServerError("Supabase is not configured for this deployment.");
      setPending(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      // Deliberately generic: do not reveal whether the account exists.
      setServerError(
        error.message === "Invalid login credentials"
          ? "That email and password combination is not recognised."
          : error.message,
      );
      setPending(false);
      return;
    }

    // Signed in is not the same as allowed in: confirm the account is on the
    // admin allowlist before leaving the page (the server checks again).
    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
    if (adminError || isAdmin !== true) {
      await supabase.auth.signOut();
      setServerError(NOT_ADMIN_MESSAGE);
      setPending(false);
      return;
    }

    const next = searchParams.get("next");
    // `refresh` lets the server re-read the new auth cookie before navigating.
    router.refresh();
    router.replace(next?.startsWith("/admin") ? next : "/admin");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <Field label="Email" htmlFor="email" error={errors.email?.message} required>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </Field>

      <Field label="Password" htmlFor="password" error={errors.password?.message} required>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </Field>

      {serverError ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {serverError}
        </p>
      ) : null}

      <Button type="submit" className="mt-1 w-full" size="lg" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Signing in…
          </>
        ) : (
          <>
            <KeyRound className="size-4" aria-hidden />
            Sign in
          </>
        )}
      </Button>
    </form>
  );
}
