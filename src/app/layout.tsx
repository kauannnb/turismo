import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
