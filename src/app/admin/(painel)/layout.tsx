import type { Metadata } from "next";
import Link from "next/link";
import { Compass, ExternalLink, LogOut } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/dal";
import { logout } from "@/app/admin/login/actions";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s · Painel" },
  robots: { index: false, follow: false },
};

export default async function PainelLayout({ children }: LayoutProps<"/admin">) {
  // Barreira real de acesso. O proxy.ts já redirecionou quem não tem cookie,
  // mas é aqui que se confirma que o usuário ainda existe no banco.
  const user = await requireAdmin();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-brand-dark">
            <Compass className="size-6 text-brand" />
            <span>Painel</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-background hover:text-foreground sm:flex"
            >
              <ExternalLink className="size-4" />
              Ver site
            </Link>
            <span className="hidden text-sm text-muted md:inline">{user.name}</span>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="size-4" />
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="lg:w-52 lg:shrink-0">
          <AdminNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
