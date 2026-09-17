const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export function whatsappUrl(message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function packageInquiryMessage(opts: {
  title: string;
  departure?: string;
  url: string;
}) {
  const lines = [
    `Olá! Tenho interesse no pacote *${opts.title}*.`,
    opts.departure ? `Saída: ${opts.departure}` : null,
    `Link: ${opts.url}`,
    "",
    "Podem me passar mais informações?",
  ];
  return lines.filter((l) => l !== null).join("\n");
}
