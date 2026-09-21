import type { Metadata } from "next";
import Link from "next/link";
import { CoverImage } from "@/components/cover-image";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { PackageCard } from "@/components/package-card";
import { PackageFilters } from "@/components/package-filters";
import { formatMonthYear } from "@/lib/format";
import {
  getCategories,
  getDestinationBySlug,
  getPackagesByDestination,
  getUpcomingMonths,
  type PackageFilters as Filters,
} from "@/lib/queries";

export async function generateMetadata(props: PageProps<"/destinos/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return {};
  return {
    title: `Pacotes para ${destination.name}`,
    description: destination.description ?? undefined,
  };
}

function parseFilters(sp: Record<string, string | string[] | undefined>): Filters {
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const maxPrice = Number(str(sp.maxPrice));
  const sort = str(sp.sort);
  return {
    category: str(sp.category),
    month: str(sp.month)?.match(/^\d{4}-\d{2}$/) ? str(sp.month) : undefined,
    maxPrice: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : undefined,
    sort:
      sort === "price-asc" || sort === "price-desc" || sort === "duration" || sort === "recent"
        ? sort
        : undefined,
  };
}

export default async function DestinationPage(props: PageProps<"/destinos/[slug]">) {
  const [{ slug }, searchParams] = await Promise.all([props.params, props.searchParams]);
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();

  const filters = parseFilters(searchParams);
  const [packages, categories, months] = await Promise.all([
    getPackagesByDestination(destination.id, filters),
    getCategories(),
    getUpcomingMonths(destination.id),
  ]);

  return (
    <>
      <section className="relative flex min-h-[420px] items-end overflow-hidden">
        <CoverImage
          src={destination.coverImage}
          alt={destination.name}
          priority
          sizes="100vw"
          showIcon={false}
          className="absolute inset-0 size-full bg-brand-dark object-cover"
        />
        {/* Dois véus: um vertical, que segura o pé, e um da esquerda, onde o
            texto fica. Só o vertical não dá conta de foto clara. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/10 to-transparent" />
        <div className="container-page relative z-10 w-full pb-12 pt-28 text-white">
          <nav className="mb-4 flex items-center gap-1 text-sm text-white/60">
            <Link href="/" className="transition hover:text-white">
              Início
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/destinos" className="transition hover:text-white">
              Destinos
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white/90">{destination.name}</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
            {destination.state}
            {destination.region ? ` · ${destination.region}` : ""}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-6xl">
            {destination.name}
          </h1>
          {destination.description && (
            <p className="mt-4 max-w-2xl leading-relaxed text-white/80">
              {destination.description}
            </p>
          )}
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mb-8 flex flex-col gap-5">
          <h2 className="text-2xl font-semibold">
            {packages.length} {packages.length === 1 ? "pacote" : "pacotes"} para {destination.name}
          </h2>
          <Suspense>
            <PackageFilters
              categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
              months={months.map((m) => ({
                value: `${m.getUTCFullYear()}-${String(m.getUTCMonth() + 1).padStart(2, "0")}`,
                label: formatMonthYear(m),
              }))}
            />
          </Suspense>
        </div>

        {packages.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-16 text-center">
            <p className="font-display text-xl font-semibold">Nenhum pacote com esses filtros</p>
            <p className="mt-2 text-sm text-muted">
              Tente remover algum filtro ou escolher outro mês.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((p) => (
              <PackageCard key={p.id} pkg={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
