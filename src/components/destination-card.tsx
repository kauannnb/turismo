import Image from "next/image";
import Link from "next/link";

type Props = {
  name: string;
  slug: string;
  state: string;
  coverImage: string;
  packageCount: number;
  size?: "sm" | "lg";
};

export function DestinationCard({ name, slug, state, coverImage, packageCount, size = "sm" }: Props) {
  return (
    <Link
      href={`/destinos/${slug}`}
      className={`group relative block overflow-hidden rounded-2xl ${size === "lg" ? "aspect-[4/5]" : "aspect-[4/3]"}`}
    >
      <Image
        src={coverImage}
        alt={name}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <h3 className="text-lg font-semibold leading-tight">
          {name} <span className="text-sm font-normal text-white/80">· {state}</span>
        </h3>
        <p className="text-xs text-white/80">
          {packageCount} {packageCount === 1 ? "pacote disponível" : "pacotes disponíveis"}
        </p>
      </div>
    </Link>
  );
}
