import Link from "next/link";
import { AlertTriangle, CalendarDays, MapPin, Package, Plus } from "lucide-react";
import { getDashboardData } from "@/lib/admin-queries";
import { requireAdmin } from "@/lib/dal";
import { formatLongDate } from "@/lib/format";

export default async function AdminHome() {
  await requireAdmin();
  const data = await getDashboardData();

  const cards = [
    { label: "Destinos", value: data.destinations, href: "/admin/destinos", icon: MapPin },
    {
      label: "Pacotes ativos",
      value: `${data.packagesActive}/${data.packagesTotal}`,
      href: "/admin/pacotes",
      icon: Package,
    },
    {
      label: "Saídas futuras",
      value: data.upcomingDepartures,
      href: "/admin/saidas",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Visão geral</h1>
          <p className="text-sm text-muted">Resumo do que está no ar agora.</p>
        </div>
        <Link
          href="/admin/pacotes/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          <Plus className="size-4" />
          Novo pacote
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl bg-surface p-5 ring-1 ring-border transition hover:ring-brand"
          >
            <div className="flex items-center gap-2 text-sm text-muted">
              <Icon className="size-4 text-brand" />
              {label}
            </div>
            <p className="mt-2 text-3xl font-bold text-brand-dark">{value}</p>
          </Link>
        ))}
      </div>

      {data.semSaida > 0 && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">
              {data.semSaida} {data.semSaida === 1 ? "pacote ativo está" : "pacotes ativos estão"} sem
              data de saída futura
            </p>
            <p className="mt-0.5 text-amber-800">
              Eles aparecem no site, mas sem nenhuma data para o cliente escolher.{" "}
              <Link href="/admin/saidas" className="font-medium underline">
                Cadastrar datas
              </Link>
            </p>
          </div>
        </div>
      )}

      <section className="rounded-2xl bg-surface ring-1 ring-border">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold">Próximas saídas</h2>
          <Link href="/admin/saidas" className="text-sm text-brand hover:underline">
            Ver todas
          </Link>
        </header>

        {data.nextDepartures.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            Nenhuma data de saída cadastrada para os próximos dias.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {data.nextDepartures.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{d.package.title}</p>
                  <p className="text-xs text-muted">{formatLongDate(d.departureDate)}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    d.spotsTotal === 0
                      ? "bg-surface-alt text-muted"
                      : d.spotsAvailable <= 0
                        ? "bg-red-100 text-red-700"
                        : d.spotsAvailable <= 5
                          ? "bg-amber-100 text-amber-800"
                          : "bg-brand-light text-brand-dark"
                  }`}
                >
                  {d.spotsTotal === 0
                    ? "vagas a definir"
                    : d.spotsAvailable <= 0
                      ? "Esgotado"
                      : `${d.spotsAvailable}/${d.spotsTotal} vagas`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
