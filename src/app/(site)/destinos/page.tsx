import type { Metadata } from "next";
import { DestinationCard } from "@/components/destination-card";
import { DestinationSearch } from "@/components/destination-search";
import { getAllDestinations, searchDestinations } from "@/lib/queries";

export const metadata: Metadata = { title: "Destinos" };

export default async function DestinationsPage(props: PageProps<"/destinos">) {
  const { q } = await props.searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  const [all, results] = await Promise.all([
    getAllDestinations(),
    query ? searchDestinations(query) : null,
  ]);

  const list = results ?? all;
  const searchable = all.map((d) => ({
    name: d.name,
    slug: d.slug,
    state: d.state,
    region: d.region,
    packageCount: d._count.packages,
  }));

  return (
    <div className="container-page py-16 sm:py-20">
      <div className="mb-12 max-w-2xl">
        <p className="eyebrow">Para onde vamos</p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Destinos</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          {all.length} lugares com saídas em grupo. Escolha um e veja os pacotes disponíveis.
        </p>
        <div className="mt-7">
          <DestinationSearch destinations={searchable} />
        </div>
      </div>

      {query && (
        <p className="mb-6 text-sm text-muted">
          {list.length === 0
            ? `Nenhum destino encontrado para "${query}".`
            : `${list.length} ${list.length === 1 ? "resultado" : "resultados"} para "${query}"`}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((d) => (
          <DestinationCard
            key={d.slug}
            name={d.name}
            slug={d.slug}
            state={d.state}
            coverImage={d.coverImage}
            packageCount={d._count.packages}
          />
        ))}
      </div>
    </div>
  );
}
