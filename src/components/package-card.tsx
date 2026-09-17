import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import type { PackageCardData } from "@/lib/queries";
import { formatDuration, formatPrice, formatShortDate } from "@/lib/format";

export function PackageCard({ pkg }: { pkg: PackageCardData }) {
  const next = pkg.departures[0];
  const lowSpots = next && next.spotsAvailable <= 5;

  return (
    <Link
      href={`/pacotes/${pkg.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={pkg.coverImage}
          alt={pkg.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-brand-dark">
            {pkg.category.name}
          </span>
          {pkg.featured && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">
              Destaque
            </span>
          )}
        </div>
        {lowSpots && (
          <span className="absolute bottom-3 left-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
            Últimas {next.spotsAvailable} vagas
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-1 text-xs text-muted">
          <MapPin className="size-3.5" />
          {pkg.destination.name}, {pkg.destination.state}
        </div>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground group-hover:text-brand-dark">
          {pkg.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted">{pkg.shortDescription}</p>

        <dl className="mt-auto grid grid-cols-2 gap-2 text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-brand" />
            <dd>{formatDuration(pkg.durationDays)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5 text-brand" />
            <dd className="truncate">Saída de {pkg.departureCity}</dd>
          </div>
          {next && (
            <div className="col-span-2 flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-brand" />
              <dd>Próxima saída: {formatShortDate(next.departureDate)}</dd>
            </div>
          )}
        </dl>

        <div className="flex items-end justify-between border-t border-border pt-3">
          <div>
            <span className="block text-xs text-muted">a partir de</span>
            <span className="text-xl font-bold text-brand-dark">{formatPrice(pkg.price)}</span>
            <span className="text-xs text-muted"> / pessoa</span>
          </div>
          <span className="rounded-full bg-brand-light px-3 py-1.5 text-xs font-semibold text-brand-dark">
            Ver detalhes
          </span>
        </div>
      </div>
    </Link>
  );
}
