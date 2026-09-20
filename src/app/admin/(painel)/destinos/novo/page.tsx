import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DestinationForm } from "@/components/admin/destination-form";
import { requireAdmin } from "@/lib/dal";
import { createDestination } from "../actions";

export const metadata = { title: "Novo destino" };

export default async function NovoDestino() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/destinos"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Destinos
      </Link>

      <h1 className="text-2xl font-bold">Novo destino</h1>

      <div className="rounded-2xl bg-surface p-6 ring-1 ring-border">
        <DestinationForm action={createDestination} submitLabel="Criar destino" />
      </div>
    </div>
  );
}
