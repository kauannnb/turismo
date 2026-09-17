import Link from "next/link";
import { Compass, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Turismo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-brand-dark">
          <Compass className="size-6 text-brand" />
          <span className="text-lg">{siteName}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-foreground/80 md:flex">
          <Link href="/destinos" className="hover:text-brand">Destinos</Link>
          <Link href="/#pacotes" className="hover:text-brand">Pacotes</Link>
          <Link href="/#como-funciona" className="hover:text-brand">Como funciona</Link>
          <Link href="/#depoimentos" className="hover:text-brand">Depoimentos</Link>
        </nav>
        <a
          href={whatsappUrl("Olá! Gostaria de informações sobre as excursões.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          <MessageCircle className="size-4" />
          <span className="hidden sm:inline">Fale conosco</span>
        </a>
      </div>
    </header>
  );
}
