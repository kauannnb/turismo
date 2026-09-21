import Link from "next/link";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import type { PackageCardData } from "@/lib/queries";
import { CoverImage } from "@/components/cover-image";
import { formatDuration, formatPrice, formatShortDate } from "@/lib/format";

export function PackageCard({ pkg }: { pkg: PackageCardData }) {
  const next = pkg.departures[0];
  // Total zero quer dizer "vagas ainda não definidas", não "quase esgotado".
  const lowSpots =
    next && next.spotsTotal > 0 && next.spotsAvailable > 0 && next.spotsAvailable <= 5;

  return (
    <Link
      href={`/pacotes/${pkg.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-lift"
    >
      <div className="relative aspect-[3/2] overflow-hidden">
        <CoverImage
          src={pkg.coverImage}
          alt={pkg.title}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Um selo só. Empilhar categoria + destaque + vagas vira poluição. */}
        {lowSpots ? (
          <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">
            Últimas {next.spotsAvailable} vagas
          </span>
        ) : pkg.category ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
            {pkg.category.name}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <MapPin className="size-3.5" />
          {pkg.destination.name}, {pkg.destination.state}
        </p>

        <h3 className="mt-2 font-display text-lg font-semibold leading-snug transition-colors group-hover:text-brand">
          {pkg.title}
        </h3>

        {pkg.shortDescription && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
            {pkg.shortDescription}
          </p>
        )}

        <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
          {pkg.durationDays && (
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              <dd>{formatDuration(pkg.durationDays)}</dd>
            </div>
          )}
          {next && (
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              <dd>Sai em {formatShortDate(next.departureDate)}</dd>
            </div>
          )}
        </dl>

        <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
          <div>
            {pkg.price ? (
              <>
                <span className="block text-xs text-muted">a partir de</span>
                <span className="font-display text-2xl font-semibold text-foreground">
                  {formatPrice(pkg.price)}
                </span>
              </>
            ) : (
              <span className="font-display text-xl font-semibold text-foreground">
                Sob consulta
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-brand transition-transform duration-300 group-hover:translate-x-0.5">
            Ver detalhes →
          </span>
        </div>
      </div>
    </Link>
  );
}
