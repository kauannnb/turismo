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
        <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-brand-light text-brand-dark">
            <Compass className="size-8" />
          </span>
          <p className="mt-6 text-sm font-semibold text-brand">Erro 404</p>
          <h1 className="mt-2 text-3xl font-bold">Essa página saiu de rota</h1>
          <p className="mt-3 text-muted">
            O endereço não existe ou o pacote pode ter saído do ar. Dá uma olhada nos destinos
            disponíveis — tem viagem boa esperando.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/destinos"
              className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Ver destinos
            </Link>
            <Link
              href="/"
              className="rounded-full px-6 py-3 text-sm font-semibold text-brand-dark ring-1 ring-border transition hover:bg-brand-light"
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
