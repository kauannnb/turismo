import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

// Inter no corpo: neutra e muito legível, do tipo que não chama atenção
// para si — é o que se espera de texto institucional.
const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

// Playfair Display nos títulos: serifa de alto contraste, imponente nos
// tamanhos grandes. Substituiu a Fraunces, que tinha um traço mais
// descontraído do que o tom que o site precisa passar.
const displayFont = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Turismo";

export const metadata: Metadata = {
  title: {
    default: `${siteName} · Excursões e pacotes de viagem`,
    template: `%s · ${siteName}`,
  },
  description:
    "Excursões e pacotes de viagem com saídas em grupo para os melhores destinos do Brasil. Transporte, hospedagem e guia inclusos.",
};

// Layout raiz mínimo: o cabeçalho e o rodapé do site público vivem em
// (site)/layout.tsx, para que /admin não os herde.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${bodyFont.variable} ${displayFont.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
