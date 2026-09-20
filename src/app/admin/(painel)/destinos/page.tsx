import Image from "next/image";
import Link from "next/link";
import { AlertCircle, CheckCircle2, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { listDestinations } from "@/lib/admin-queries";
import { requireAdmin } from "@/lib/dal";
import { deleteDestination } from "./actions";

export const metadata = { title: "Destinos" };

export default async function AdminDestinos(props: PageProps<"/admin/destinos">) {
  await requireAdmin();
  const searchParams = await props.searchParams;
  const destinations = await listDestinations();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Destinos</h1>
          <p className="text-sm text-muted">
            {destinations.length} {destinations.length === 1 ? "cadastrado" : "cadastrados"}
          </p>
        </div>
        <Link
          href="/admin/destinos/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          <Plus className="size-4" />
          Novo destino
        </Link>
      </div>

      {searchParams.erro === "com-pacotes" && (
        <p className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" />
          Esse destino tem pacotes vinculados. Remova ou mova os pacotes antes de excluí-lo.
        </p>
      )}
      {searchParams.ok === "removido" && (
        <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 className="size-4 shrink-0" />
          Destino removido.
        </p>
      )}

      {destinations.length === 0 ? (
        <div className="rounded-2xl bg-surface p-12 text-center ring-1 ring-border">
          <MapPin className="mx-auto size-8 text-muted" />
          <p className="mt-3 font-semibold">Nenhum destino cadastrado</p>
          <p className="mt-1 text-sm text-muted">Comece criando o primeiro.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {destinations.map((d) => (
            <li key={d.id} className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
              <div className="relative aspect-[16/9]">
                <Image
                  src={d.coverImage}
                  alt={d.name}
                  fill
                  sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                {d.featured && (
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">
                    <Star className="size-3 fill-current" />
                    Destaque
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3 p-4">
                <div>
                  <h2 className="font-semibold">
                    {d.name} <span className="font-normal text-muted">· {d.state}</span>
                  </h2>
                  <p className="text-xs text-muted">
                    {d.region} · {d._count.packages}{" "}
                    {d._count.packages === 1 ? "pacote" : "pacotes"}
                  </p>
                </div>

                <div className="flex items-center gap-2 border-t border-border pt-3">
                  <Link
                    href={`/admin/destinos/${d.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-background px-3 py-1.5 text-xs font-medium transition hover:bg-brand-light hover:text-brand-dark"
                  >
                    <Pencil className="size-3.5" />
                    Editar
                  </Link>
                  <Link
                    href={`/destinos/${d.slug}`}
                    target="_blank"
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition hover:text-foreground"
                  >
                    Ver no site
                  </Link>
                  <form action={deleteDestination} className="ml-auto">
                    <input type="hidden" name="id" value={d.id} />
                    <button
                      type="submit"
                      title={
                        d._count.packages > 0
                          ? "Tem pacotes vinculados — remova-os antes"
                          : "Excluir destino"
                      }
                      className="rounded-lg p-1.5 text-muted transition hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
