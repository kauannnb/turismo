import Link from "next/link";
import { CalendarDays, Pencil } from "lucide-react";
import { listDeparturesGrouped } from "@/lib/admin-queries";
import { requireAdmin } from "@/lib/dal";
import { formatLongDate, formatMonthYear, formatPrice, formatShortDate } from "@/lib/format";

export const metadata = { title: "Datas de saída" };

export default async function AdminSaidas() {
  await requireAdmin();
  const { upcoming, pastCount } = await listDeparturesGrouped();

  // Agrupa por mês para a lista não virar um paredão de datas soltas.
  const byMonth = new Map<string, typeof upcoming>();
  for (const d of upcoming) {
    const key = formatMonthYear(d.departureDate);
    const list = byMonth.get(key) ?? [];
    list.push(d);
    byMonth.set(key, list);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold">Datas de saída</h1>
        <p className="text-sm text-muted">
          {upcoming.length} {upcoming.length === 1 ? "saída futura" : "saídas futuras"} ·{" "}
          {pastCount} já {pastCount === 1 ? "passou" : "passaram"}
        </p>
      </div>

      <p className="rounded-lg bg-background px-4 py-3 text-sm text-muted">
        As datas são cadastradas dentro de cada pacote, junto com as vagas e o preço daquela saída.
      </p>

      {upcoming.length === 0 ? (
        <div className="rounded-2xl bg-surface p-12 text-center ring-1 ring-border">
          <CalendarDays className="mx-auto size-8 text-muted" />
          <p className="mt-3 font-semibold">Nenhuma saída futura cadastrada</p>
          <p className="mt-1 text-sm text-muted">
            Os pacotes aparecem no site, mas sem data o cliente não tem o que reservar.
          </p>
          <Link
            href="/admin/pacotes"
            className="mt-4 inline-block rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            Ir para pacotes
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {[...byMonth.entries()].map(([month, items]) => (
            <section key={month}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                {month}
              </h2>
              <ul className="divide-y divide-border rounded-2xl bg-surface ring-1 ring-border">
                {items.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{d.package.title}</p>
                      <p className="text-xs text-muted">
                        {formatLongDate(d.departureDate)} → {formatShortDate(d.returnDate)}
                        {d.price ? ` · ${formatPrice(d.price)}` : ""}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        d.spotsAvailable <= 0
                          ? "bg-red-100 text-red-700"
                          : d.spotsAvailable <= 5
                            ? "bg-amber-100 text-amber-800"
                            : "bg-brand-light text-brand-dark"
                      }`}
                    >
                      {d.spotsAvailable <= 0
                        ? "Esgotado"
                        : `${d.spotsAvailable}/${d.spotsTotal} vagas`}
                    </span>

                    <Link
                      href={`/admin/pacotes/${d.package.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-background px-3 py-1.5 text-xs font-medium transition hover:bg-brand-light hover:text-brand-dark"
                    >
                      <Pencil className="size-3.5" />
                      Editar
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
