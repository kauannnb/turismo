"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

type Option = { value: string; label: string };

type Props = {
  categories: Option[];
  months: Option[];
};

const priceOptions: Option[] = [
  { value: "500", label: "Até R$ 500" },
  { value: "1500", label: "Até R$ 1.500" },
  { value: "3000", label: "Até R$ 3.000" },
  { value: "5000", label: "Até R$ 5.000" },
];

const sortOptions: Option[] = [
  { value: "recent", label: "Mais recentes" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
  { value: "duration", label: "Menor duração" },
];

export function PackageFilters({ categories, months }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const hasFilters = ["category", "month", "maxPrice"].some((k) => params.get(k));

  const selectClass =
    "cursor-pointer rounded-full border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none transition hover:border-foreground/25 focus:border-brand";

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="flex items-center gap-1.5 pr-1 text-sm text-muted">
        <SlidersHorizontal className="size-4" /> Filtrar
      </span>

      <select
        aria-label="Categoria"
        value={params.get("category") ?? ""}
        onChange={(e) => update("category", e.target.value)}
        className={selectClass}
      >
        <option value="">Todas as categorias</option>
        {categories.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      <select
        aria-label="Mês de saída"
        value={params.get("month") ?? ""}
        onChange={(e) => update("month", e.target.value)}
        className={selectClass}
      >
        <option value="">Qualquer mês</option>
        {months.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>

      <select
        aria-label="Preço máximo"
        value={params.get("maxPrice") ?? ""}
        onChange={(e) => update("maxPrice", e.target.value)}
        className={selectClass}
      >
        <option value="">Qualquer preço</option>
        {priceOptions.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      <select
        aria-label="Ordenar por"
        value={params.get("sort") ?? "recent"}
        onChange={(e) => update("sort", e.target.value)}
        className={`${selectClass} ml-auto`}
      >
        {sortOptions.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <X className="size-4" /> Limpar
        </button>
      )}
    </div>
  );
}
