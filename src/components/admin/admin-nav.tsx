"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, MapPin, Package } from "lucide-react";

const items = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/admin/destinos", label: "Destinos", icon: MapPin },
  { href: "/admin/pacotes", label: "Pacotes", icon: Package },
  { href: "/admin/saidas", label: "Datas de saída", icon: CalendarDays },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-brand-light text-brand-dark"
                : "text-foreground/70 hover:bg-background hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
