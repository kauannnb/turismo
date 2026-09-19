import Link from "next/link";
import { Compass, MessageCircle, Mail, MapPin } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Turismo";

// lucide-react v1 removeu os ícones de marca — desenhados aqui no mesmo estilo (24px, stroke).
const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
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

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-semibold text-brand-dark">
            <Compass className="size-6 text-brand" />
            <span className="text-lg">{siteName}</span>
          </div>
          <p className="text-sm text-muted">
            Excursões e pacotes com saídas em grupo, transporte confortável e guias que conhecem cada destino.
          </p>
          <div className="flex gap-3 text-muted">
            <a href="#" aria-label="Instagram" className="hover:text-brand"><Instagram className="size-5" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-brand"><Facebook className="size-5" /></a>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">Navegação</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/destinos" className="hover:text-brand">Todos os destinos</Link></li>
            <li><Link href="/#pacotes" className="hover:text-brand">Pacotes em destaque</Link></li>
            <li><Link href="/#como-funciona" className="hover:text-brand">Como funciona</Link></li>
            <li><Link href="/#depoimentos" className="hover:text-brand">Depoimentos</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">Institucional</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li><a href="#" className="hover:text-brand">Sobre nós</a></li>
            <li><a href="#" className="hover:text-brand">Termos de uso</a></li>
            <li><a href="#" className="hover:text-brand">Política de privacidade</a></li>
            <li><a href="#" className="hover:text-brand">Política de cancelamento</a></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">Contato</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <a href={whatsappUrl("Olá! Gostaria de informações.")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-brand">
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </li>
            <li className="flex items-center gap-2"><Mail className="size-4" /> contato@exemplo.com.br</li>
            <li className="flex items-center gap-2"><MapPin className="size-4" /> São Paulo, SP</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {siteName}. Cadastur 00.000000.00.0001-0 · CNPJ 00.000.000/0001-00
      </div>
    </footer>
  );
}
