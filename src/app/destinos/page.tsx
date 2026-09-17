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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 flex flex-col items-center gap-6 text-center">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Destinos</h1>
          <p className="mt-2 text-muted">Escolha para onde você quer ir e veja os pacotes disponíveis</p>
        </div>
        <DestinationSearch destinations={searchable} />
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
