import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
    description: destination.description,
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
      <section className="relative flex min-h-[320px] items-end overflow-hidden">
        <Image
          src={destination.coverImage}
          alt={destination.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-10 pt-24 text-white">
          <nav className="mb-3 flex items-center gap-1 text-sm text-white/80">
            <Link href="/" className="hover:text-white">Início</Link>
            <ChevronRight className="size-4" />
            <Link href="/destinos" className="hover:text-white">Destinos</Link>
            <ChevronRight className="size-4" />
            <span className="text-white">{destination.name}</span>
          </nav>
          <h1 className="text-3xl font-bold sm:text-5xl">
            {destination.name} <span className="text-2xl font-normal text-white/80">· {destination.state}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-white/90">{destination.description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold">
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
          <div className="rounded-2xl bg-surface p-12 text-center ring-1 ring-border">
            <p className="text-lg font-semibold">Nenhum pacote encontrado com esses filtros.</p>
            <p className="mt-1 text-sm text-muted">Tente remover algum filtro ou escolher outro mês.</p>
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
