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
      <section className="relative flex min-h-[380px] items-end overflow-hidden">
        <Image
          src={pkg.coverImage}
          alt={pkg.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-10 pt-24 text-white">
          <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm text-white/80">
            <Link href="/" className="hover:text-white">Início</Link>
            <ChevronRight className="size-4" />
            <Link href="/destinos" className="hover:text-white">Destinos</Link>
            <ChevronRight className="size-4" />
            <Link href={`/destinos/${pkg.destination.slug}`} className="hover:text-white">
              {pkg.destination.name}
            </Link>
          </nav>
          <span className="inline-block rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-dark">
            {pkg.category.name}
          </span>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{pkg.title}</h1>
          <p className="mt-3 max-w-2xl text-white/90">{pkg.shortDescription}</p>
          <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
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

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-10">
          {gallery.length > 1 && (
            <section>
              <h2 className="mb-4 text-xl font-bold">Fotos</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {gallery.map((img, i) => (
                  <div
                    key={`${img.url}-${i}`}
                    className={`relative overflow-hidden rounded-2xl ring-1 ring-border ${
                      i === 0 ? "aspect-[16/10] sm:col-span-3" : "aspect-[4/3]"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      sizes={i === 0 ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 640px) 20vw, 100vw"}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-xl font-bold">Sobre o pacote</h2>
            <div className="space-y-3 leading-relaxed text-muted">
              {pkg.description.split("\n").filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          {(included.length > 0 || notIncluded.length > 0) && (
            <section className="grid gap-6 sm:grid-cols-2">
              {included.length > 0 && (
                <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
                  <h2 className="mb-3 text-base font-bold">O que está incluso</h2>
                  <ul className="space-y-2 text-sm">
                    {included.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {notIncluded.length > 0 && (
                <div className="rounded-2xl bg-surface p-5 ring-1 ring-border">
                  <h2 className="mb-3 text-base font-bold">Não incluso</h2>
                  <ul className="space-y-2 text-sm text-muted">
                    {notIncluded.map((item) => (
                      <li key={item} className="flex gap-2">
                        <X className="mt-0.5 size-4 shrink-0 text-red-500" />
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
              <h2 className="mb-4 text-xl font-bold">Roteiro dia a dia</h2>
              <ol className="relative flex flex-col gap-6 border-l border-border pl-6">
                {itinerary.map((day) => (
                  <li key={day.day} className="relative">
                    <span className="absolute -left-[31px] flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                      {day.day}
                    </span>
                    <h3 className="font-semibold">Dia {day.day} · {day.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{day.description}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section id="saidas">
            <h2 className="mb-4 text-xl font-bold">Datas de saída</h2>
            {pkg.departures.length === 0 ? (
              <div className="rounded-2xl bg-surface p-8 text-center ring-1 ring-border">
                <p className="font-semibold">Sem datas publicadas no momento.</p>
                <p className="mt-1 text-sm text-muted">
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
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface p-4 ring-1 ring-border"
                    >
                      <div>
                        <p className="font-semibold">
                          {formatLongDate(d.departureDate)}
                          <span className="font-normal text-muted"> → {formatShortDate(d.returnDate)}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {soldOut
                            ? "Esgotado"
                            : `${d.spotsAvailable} de ${d.spotsTotal} vagas disponíveis`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-brand-dark">
                          {formatPrice(d.price ?? pkg.price)}
                        </span>
                        {soldOut ? (
                          <span className="rounded-full bg-border px-4 py-2 text-sm font-semibold text-muted">
                            Esgotado
                          </span>
                        ) : (
                          <WhatsAppButton
                            message={inquiry(d.departureDate)}
                            label="Reservar"
                            className="px-4 py-2 text-sm"
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
              <h2 className="mb-4 text-xl font-bold">Quem já foi</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {pkg.testimonials.map((t) => (
                  <figure key={t.id} className="rounded-2xl bg-surface p-5 ring-1 ring-border">
                    <div className="mb-2 flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            i < t.rating ? "fill-accent text-accent" : "text-border"
                          }`}
                        />
                      ))}
                    </div>
                    <blockquote className="text-sm leading-relaxed text-muted">“{t.text}”</blockquote>
                    <figcaption className="mt-3 text-sm font-semibold">
                      {t.authorName}
                      <span className="font-normal text-muted"> · {t.authorCity}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border">
            <span className="block text-xs text-muted">a partir de</span>
            <p className="text-3xl font-bold text-brand-dark">{formatPrice(pkg.price)}</p>
            <span className="text-xs text-muted">por pessoa</span>

            <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
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
              className="mt-5 w-full"
            />
            {pkg.departures.length > 0 && (
              <a
                href="#saidas"
                className="mt-3 block rounded-full px-4 py-2 text-center text-sm font-semibold text-brand-dark hover:bg-brand-light"
              >
                Ver todas as datas
              </a>
            )}
            <p className="mt-4 text-center text-xs text-muted">
              Sem taxa de reserva. Tire suas dúvidas antes de fechar.
            </p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-14">
          <h2 className="mb-6 text-xl font-bold">
            Outros pacotes para {pkg.destination.name}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PackageCard key={p.id} pkg={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
