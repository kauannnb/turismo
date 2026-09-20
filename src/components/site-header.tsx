import Link from "next/link";
import { Compass, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Turismo";

const links = [
  { href: "/destinos", label: "Destinos" },
  { href: "/#pacotes", label: "Pacotes" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#depoimentos", label: "Depoimentos" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="container-page flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white">
            <Compass className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            {siteName}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative text-sm text-foreground/70 transition-colors hover:text-foreground after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-brand after:transition-all hover:after:w-full"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <a
          href={whatsappUrl("Olá! Gostaria de informações sobre as excursões.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:bg-brand-dark sm:px-5"
        >
          <MessageCircle className="size-4" />
          <span className="hidden sm:inline">Falar com a gente</span>
          <span className="sm:hidden">WhatsApp</span>
        </a>
      </div>
    </header>
  );
}
