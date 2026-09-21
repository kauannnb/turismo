import Link from "next/link";
import { CalendarDays, CheckCircle2, ImageIcon, Package, Pencil, Plus } from "lucide-react";
import { CoverImage } from "@/components/cover-image";
import { listPackages } from "@/lib/admin-queries";
import { requireAdmin } from "@/lib/dal";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Pacotes" };

export default async function AdminPacotes(props: PageProps<"/admin/pacotes">) {
  await requireAdmin();
  const searchParams = await props.searchParams;
  const packages = await listPackages();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pacotes</h1>
          <p className="text-sm text-muted">
            {packages.filter((p) => p.active).length} publicados de {packages.length}
          </p>
        </div>
        <Link
          href="/admin/pacotes/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          <Plus className="size-4" />
          Novo pacote
        </Link>
      </div>

      {searchParams.ok === "removido" && (
        <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 className="size-4 shrink-0" />
          Pacote removido.
        </p>
      )}

      {packages.length === 0 ? (
        <div className="rounded-2xl bg-surface p-12 text-center ring-1 ring-border">
          <Package className="mx-auto size-8 text-muted" />
          <p className="mt-3 font-semibold">Nenhum pacote cadastrado</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {packages.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl bg-surface p-3 ring-1 ring-border"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                <CoverImage
                  src={p.coverImage}
                  alt={p.title}
                  sizes="64px"
                  className="absolute inset-0 size-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-semibold">{p.title}</h2>
                  {!p.active && (
                    <span className="rounded-full bg-border px-2 py-0.5 text-xs font-medium text-muted">
                      Rascunho
                    </span>
                  )}
                  {p.featured && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent-dark">
                      Destaque
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted">
                  {p.destination.name} · {p.destination.state}
                  {p.category ? ` · ${p.category.name}` : ""}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span className="font-semibold text-brand-dark">
                    {p.price ? formatPrice(p.price) : "sem preço"}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    {p._count.departures} {p._count.departures === 1 ? "saída" : "saídas"}
                  </span>
                  <span className="flex items-center gap-1">
                    <ImageIcon className="size-3.5" />
                    {p._count.images} {p._count.images === 1 ? "foto" : "fotos"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/pacotes/${p.slug}`}
                  target="_blank"
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition hover:text-foreground"
                >
                  Ver
                </Link>
                <Link
                  href={`/admin/pacotes/${p.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-background px-3 py-1.5 text-xs font-medium transition hover:bg-brand-light hover:text-brand-dark"
                >
                  <Pencil className="size-3.5" />
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
