import Link from "next/link";
import { Compass, Mail, MapPin, MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Turismo";

// lucide-react v1 removeu os ícones de marca — desenhados aqui no mesmo estilo.
const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Instagram({ className }: { className?: string }) {
  return (
    <svg {...svgProps} className={className} aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function Facebook({ className }: { className?: string }) {
  return (
    <svg {...svgProps} className={className} aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const nav = [
  { href: "/destinos", label: "Todos os destinos" },
  { href: "/#pacotes", label: "Pacotes em destaque" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#depoimentos", label: "Depoimentos" },
];

const institucional = [
  "Sobre nós",
  "Termos de uso",
  "Política de privacidade",
  "Política de cancelamento",
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white">
              <Compass className="size-5" />
            </span>
            <span className="font-display text-lg font-semibold">{siteName}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Excursões e pacotes com saídas em grupo, transporte confortável e guias que conhecem
            cada destino.
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href="#"
              aria-label="Instagram"
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted transition hover:border-brand hover:text-brand"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="flex size-9 items-center justify-center rounded-full border border-border text-muted transition hover:border-brand hover:text-brand"
            >
              <Facebook className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
            Navegação
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            {nav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition hover:text-brand">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
            Institucional
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            {institucional.map((label) => (
              <li key={label}>
                <a href="#" className="transition hover:text-brand">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
            Contato
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li>
              <a
                href={whatsappUrl("Olá! Gostaria de informações.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition hover:text-brand"
              >
                <MessageCircle className="size-4 shrink-0" /> WhatsApp
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" /> contato@exemplo.com.br
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" /> Santos, SP
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-5 text-xs text-muted">
          <span>
            © {new Date().getFullYear()} {siteName}
          </span>
          <span>Cadastur 00.000000.00.0001-0 · CNPJ 00.000.000/0001-00</span>
        </div>
      </div>
    </footer>
  );
}
