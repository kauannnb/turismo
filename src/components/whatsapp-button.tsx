import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";

type Props = {
  message: string;
  label?: string;
  className?: string;
};

export function WhatsAppButton({ message, label = "Reservar pelo WhatsApp", className = "" }: Props) {
  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-[#1ebe5a] ${className}`}
    >
      <MessageCircle className="size-5" />
      {label}
    </a>
  );
}
