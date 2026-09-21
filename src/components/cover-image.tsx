import Image from "next/image";
import { ImageOff } from "lucide-react";

type Props = {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Mostra o ícone de "sem imagem". Desligue em capas grandes, onde um
   *  fundo liso fica melhor do que um ícone gigante no meio da tela. */
  showIcon?: boolean;
};

/**
 * Capa que aguenta ausência de imagem. Desde que os campos viraram
 * opcionais, qualquer destino ou pacote pode estar sem foto — e
 * `<Image src={null}>` quebraria a página inteira.
 */
export function CoverImage({ src, alt, sizes, className = "", priority, showIcon = true }: Props) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-surface-alt to-border ${className}`}
        role="presentation"
      >
        {showIcon && <ImageOff className="size-6 text-muted/50" strokeWidth={1.5} />}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
