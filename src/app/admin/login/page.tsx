import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Entrar no painel",
  robots: { index: false, follow: false },
};

export default async function LoginPage(props: PageProps<"/admin/login">) {
  const searchParams = await props.searchParams;
  const raw = searchParams.next;
  const next = typeof raw === "string" && raw.startsWith("/admin") ? raw : "/admin";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 text-brand-dark">
          <Compass className="size-7 text-brand" />
          <span className="text-xl font-semibold">
            {process.env.NEXT_PUBLIC_SITE_NAME ?? "Turismo"}
          </span>
        </Link>

        <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border">
          <h1 className="text-xl font-bold">Painel administrativo</h1>
          <p className="mb-6 mt-1 text-sm text-muted">
            Entre para gerenciar destinos, pacotes e datas de saída.
          </p>
          <LoginForm next={next} />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="hover:text-brand">
            ← Voltar ao site
          </Link>
        </p>
      </div>
    </main>
  );
}
