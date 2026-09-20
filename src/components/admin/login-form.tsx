"use client";

import { useActionState } from "react";
import { AlertCircle, LogIn } from "lucide-react";
import { login, type LoginState } from "@/app/admin/login/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Senha</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </label>

      {state?.error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        <LogIn className="size-4" />
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
