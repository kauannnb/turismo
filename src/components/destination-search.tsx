"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";

export type SearchableDestination = {
  name: string;
  slug: string;
  state: string;
  region: string | null;
  packageCount: number;
};

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function DestinationSearch({ destinations }: { destinations: SearchableDestination[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    const list = q
      ? destinations.filter((d) => normalize(`${d.name} ${d.state} ${d.region ?? ""}`).includes(q))
      : destinations;
    return list.slice(0, 6);
  }, [query, destinations]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(d?: SearchableDestination) {
    setOpen(false);
    if (d) {
      router.push(`/destinos/${d.slug}`);
    } else if (query.trim()) {
      router.push(`/destinos?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/destinos");
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(results[active]);
        }}
        className="flex items-center gap-2 rounded-full bg-surface p-2 shadow-lift"
      >
        <div className="flex flex-1 items-center gap-3 pl-5">
          <Search className="size-5 shrink-0 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder="Para onde você quer ir?"
            aria-label="Buscar destino"
            autoComplete="off"
            className="w-full bg-transparent py-2.5 text-base text-foreground outline-none placeholder:text-muted"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-brand px-7 py-3 text-sm font-medium text-white transition hover:bg-brand-dark"
        >
          Buscar
        </button>
      </form>

      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-lift"
        >
          {results.map((d, i) => (
            <li key={d.slug} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(d)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                  i === active ? "bg-brand-light" : "hover:bg-surface-alt"
                }`}
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-brand-light text-brand">
                  <MapPin className="size-4" />
                </span>
                <span className="flex-1">
                  <span className="block font-medium text-foreground">
                    {d.name}, {d.state}
                  </span>
                  <span className="block text-xs text-muted">{d.region ?? "—"}</span>
                </span>
                <span className="text-xs text-muted">
                  {d.packageCount} {d.packageCount === 1 ? "pacote" : "pacotes"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
