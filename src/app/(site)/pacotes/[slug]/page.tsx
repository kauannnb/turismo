import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  MapPin,
  Star,
  Users,
  X,
} from "lucide-react";
import { PackageCard } from "@/components/package-card";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { formatDuration, formatLongDate, formatPrice, formatShortDate } from "@/lib/format";
import { getPackageBySlug, getRelatedPackages } from "@/lib/queries";
import { packageInquiryMessage } from "@/lib/whatsapp";

type ItineraryDay = { day: number; title: string; description: string };

function asStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function asItinerary(value: unknown): ItineraryDay[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is ItineraryDay =>
      typeof v === "object" &&
      v !== null &&
      typeof (v as ItineraryDay).day === "number" &&
      typeof (v as ItineraryDay).title === "string" &&
      typeof (v as ItineraryDay).description === "string",
  );
}

export async function generateMetadata(props: PageProps<"/pacotes/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) return {};
  return {
    title: pkg.title,
    description: pkg.shortDescription,
    openGraph: {
      title: pkg.title,
      description: pkg.shortDescription,
      images: [pkg.coverImage],
    },
  };
}

export default async function PackagePage(props: PageProps<"/pacotes/[slug]">) {
  const { slug } = await props.params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();

  const related = await getRelatedPackages(pkg.destinationId, pkg.id);

  const included = asStringList(pkg.included);
  const notIncluded = asStringList(pkg.notIncluded);
  const itinerary = asItinerary(pkg.itinerary).sort((a, b) => a.day - b.day);
  const gallery = [{ url: pkg.coverImage, alt: pkg.title }, ...pkg.images];
  const nextDeparture = pkg.departures[0];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const pageUrl = `${siteUrl}/pacotes/${pkg.slug}`;

  const inquiry = (departure?: Date) =>
    packageInquiryMessage({
      title: pkg.title,
      departure: departure ? formatLongDate(departure) : undefined,
      url: pageUrl,
    });

  return (
    <>
      <section className="relative flex min-h-[460px] items-end overflow-hidden">
        <Image
          src={pkg.coverImage}
          alt={pkg.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/10 to-transparent" />
        <div className="container-page relative z-10 w-full pb-12 pt-28 text-white">
          <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-white/60">
            <Link href="/" className="transition hover:text-white">
              Início
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/destinos" className="transition hover:text-white">
              Destinos
            </Link>
            <ChevronRight className="size-3.5" />
            <Link
              href={`/destinos/${pkg.destination.slug}`}
              className="transition hover:text-white"
            >
              {pkg.destination.name}
            </Link>
          </nav>
          <span className="inline-block rounded-full border border-white/25 px-3 py-1 text-xs font-medium text-white/80">
            {pkg.category.name}
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.08] sm:text-5xl">
            {pkg.title}
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-white/80">{pkg.shortDescription}</p>
          <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              <dd>{pkg.destination.name}, {pkg.destination.state}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-4" />
              <dd>{formatDuration(pkg.durationDays)}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="size-4" />
              <dd>Saída de {pkg.departureCity}</dd>
            </div>
            {nextDeparture && (
              <div className="flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                <dd>Próxima saída: {formatShortDate(nextDeparture.departureDate)}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-12">
          {gallery.length > 1 && (
            <section>
              <h2 className="mb-5 text-2xl font-semibold">Fotos</h2>

              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
                <Image
                  src={gallery[0].url}
                  alt={gallery[0].alt}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
              </div>

              {/* flex-1 em vez de grade fixa: com 2 ou 5 fotos a linha fica
                  preenchida do mesmo jeito, sem buraco na última coluna. */}
              <div className="mt-3 flex flex-wrap gap-3">
                {gallery.slice(1).map((img, i) => (
                  <div
                    key={`${img.url}-${i}`}
                    className="relative aspect-[4/3] min-w-[160px] flex-1 overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      sizes="(min-width: 640px) 25vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Sobre o pacote</h2>
            <div className="space-y-4 leading-relaxed text-muted">
              {pkg.description.split("\n").filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          {(included.length > 0 || notIncluded.length > 0) && (
            <section className="grid gap-6 sm:grid-cols-2">
              {included.length > 0 && (
                <div className="rounded-2xl border border-border bg-surface p-6">
                  <h2 className="mb-4 text-lg font-semibold">O que está incluso</h2>
                  <ul className="space-y-2.5 text-sm">
                    {included.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <Check className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={2.5} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {notIncluded.length > 0 && (
                <div className="rounded-2xl border border-border bg-surface p-6">
                  <h2 className="mb-4 text-lg font-semibold">Não incluso</h2>
                  <ul className="space-y-2.5 text-sm text-muted">
                    {notIncluded.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <X className="mt-0.5 size-4 shrink-0 text-muted/60" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {itinerary.length > 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-semibold">Roteiro dia a dia</h2>
              <ol className="relative flex flex-col gap-7 border-l border-border pl-7">
                {itinerary.map((day) => (
                  <li key={day.day} className="relative">
                    <span className="absolute -left-[37px] flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-white ring-4 ring-background">
                      {day.day}
                    </span>
                    <h3 className="text-base font-semibold">
                      Dia {day.day} · {day.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{day.description}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section id="saidas" className="scroll-mt-24">
            <h2 className="mb-5 text-2xl font-semibold">Datas de saída</h2>
            {pkg.departures.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface p-10 text-center">
                <p className="font-semibold">Sem datas publicadas no momento.</p>
                <p className="mt-1.5 text-sm text-muted">
                  Fale com a gente pelo WhatsApp para saber das próximas saídas.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {pkg.departures.map((d) => {
                  const soldOut = d.spotsAvailable <= 0;
                  return (
                    <li
                      key={d.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-5 transition hover:border-foreground/20"
                    >
                      <div>
                        <p className="font-semibold">
                          {formatLongDate(d.departureDate)}
                          <span className="font-normal text-muted">
                            {" → "}
                            {formatShortDate(d.returnDate)}
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {soldOut
                            ? "Esgotado"
                            : `${d.spotsAvailable} de ${d.spotsTotal} vagas disponíveis`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-display text-xl font-semibold">
                          {formatPrice(d.price ?? pkg.price)}
                        </span>
                        {soldOut ? (
                          <span className="rounded-full bg-surface-alt px-4 py-2.5 text-sm font-medium text-muted">
                            Esgotado
                          </span>
                        ) : (
                          <WhatsAppButton
                            message={inquiry(d.departureDate)}
                            label="Reservar"
                            className="px-5 py-2.5 text-sm"
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {pkg.testimonials.length > 0 && (
            <section>
              <h2 className="mb-5 text-2xl font-semibold">Quem já foi</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {pkg.testimonials.map((t) => (
                  <figure key={t.id} className="rounded-2xl border border-border bg-surface p-6">
                    <div className="mb-3 flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < t.rating ? "fill-accent text-accent" : "text-border"
                          }`}
                        />
                      ))}
                    </div>
                    <blockquote className="text-sm leading-relaxed text-foreground/85">
                      “{t.text}”
                    </blockquote>
                    <figcaption className="mt-4 border-t border-border pt-3 text-sm font-semibold">
                      {t.authorName}
                      <span className="font-normal text-muted"> · {t.authorCity}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-[92px] lg:h-fit">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
            <span className="block text-xs text-muted">a partir de</span>
            <p className="font-display text-4xl font-semibold">{formatPrice(pkg.price)}</p>
            <span className="text-xs text-muted">por pessoa</span>

            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="size-4 shrink-0 text-brand" />
                <dd>{formatDuration(pkg.durationDays)}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Users className="size-4 shrink-0 text-brand" />
                <dd>Saída de {pkg.departureCity}</dd>
              </div>
              {nextDeparture && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 shrink-0 text-brand" />
                  <dd>Próxima saída em {formatLongDate(nextDeparture.departureDate)}</dd>
                </div>
              )}
            </dl>

            <WhatsAppButton
              message={inquiry(nextDeparture?.departureDate)}
              className="mt-6 w-full"
            />
            {pkg.departures.length > 0 && (
              <a
                href="#saidas"
                className="mt-2.5 block rounded-full px-4 py-2.5 text-center text-sm font-medium text-muted transition hover:bg-surface-alt hover:text-foreground"
              >
                Ver todas as {pkg.departures.length} datas
              </a>
            )}
            <p className="mt-5 text-center text-xs leading-relaxed text-muted">
              Sem taxa de reserva.
              <br />
              Tire suas dúvidas antes de fechar.
            </p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="border-t border-border bg-surface py-16">
          <div className="container-page">
            <h2 className="mb-8 text-2xl font-semibold">
              Outros pacotes para {pkg.destination.name}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PackageCard key={p.id} pkg={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
