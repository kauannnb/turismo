import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { DestinationForm } from "@/components/admin/destination-form";
import { getDestination } from "@/lib/admin-queries";
import { requireAdmin } from "@/lib/dal";
import { updateDestination } from "../actions";

export const metadata = { title: "Editar destino" };

export default async function EditarDestino(props: PageProps<"/admin/destinos/[id]">) {
  await requireAdmin();

  const [{ id }, searchParams] = await Promise.all([props.params, props.searchParams]);
  const destinationId = Number(id);
  if (!Number.isInteger(destinationId)) notFound();

  const destination = await getDestination(destinationId);
  if (!destination) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/destinos"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Destinos
      </Link>

      {(searchParams.ok === "criado" || searchParams.ok === "salvo") && (
        <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 className="size-4 shrink-0" />
          {searchParams.ok === "criado" ? "Destino criado." : "Alterações salvas."}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{destination.name}</h1>
        <Link
          href={`/destinos/${destination.slug}`}
          target="_blank"
          className="text-sm text-brand hover:underline"
        >
          Ver no site
        </Link>
      </div>

      <div className="rounded-2xl bg-surface p-6 ring-1 ring-border">
        <DestinationForm
          action={updateDestination.bind(null, destination.id)}
          initial={destination}
          submitLabel="Salvar alterações"
        />
      </div>
    </div>
  );
}
