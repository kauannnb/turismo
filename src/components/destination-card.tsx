import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Props = {
  name: string;
  slug: string;
  state: string;
  coverImage: string;
  packageCount: number;
  size?: "sm" | "lg";
};

export function DestinationCard({
  name,
  slug,
  state,
  coverImage,
  packageCount,
  size = "sm",
}: Props) {
  return (
    <Link
      href={`/destinos/${slug}`}
      className={`group relative block overflow-hidden rounded-2xl bg-foreground/5 ${
        size === "lg" ? "aspect-[4/5]" : "aspect-[5/4]"
      }`}
    >
      <Image
        src={coverImage}
        alt={name}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />

      {/* Degradê forte embaixo (onde fica o texto) e quase nada em cima, para
          não apagar a foto. Em fotos claras, 80% no pé não basta. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/0" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-semibold leading-tight">{name}</h3>
          <p className="mt-0.5 text-xs text-white/70">
            {state} · {packageCount} {packageCount === 1 ? "pacote" : "pacotes"}
          </p>
        </div>
        <span className="flex size-9 shrink-0 translate-y-1 items-center justify-center rounded-full bg-white/15 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </Link>
  );
}
