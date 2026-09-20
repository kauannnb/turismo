import Link from "next/link";
import { Compass } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// 404 global. Traz o cabeçalho e o rodapé por conta própria porque o layout
// raiz é mínimo — quem tem a moldura do site é (site)/layout.tsx, e uma URL
// que não casa com rota nenhuma não entra nesse grupo.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto flex max-w-xl flex-col items-center px-5 py-28 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-light text-brand">
            <Compass className="size-7" />
          </span>
          <p className="eyebrow mt-7">Erro 404</p>
          <h1 className="mt-3 text-4xl font-semibold">Essa página saiu de rota</h1>
          <p className="mt-4 leading-relaxed text-muted">
            O endereço não existe ou o pacote pode ter saído do ar. Dá uma olhada nos destinos
            disponíveis — tem viagem boa esperando.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/destinos"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:bg-brand-dark"
            >
              Ver destinos
            </Link>
            <Link
              href="/"
              className="rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:border-foreground/25"
            >
              Voltar ao início
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
