import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronLeft, Trash2 } from "lucide-react";
import { DepartureManager } from "@/components/admin/departure-manager";
import { GalleryManager } from "@/components/admin/gallery-manager";
import { PackageForm, type ItineraryDay } from "@/components/admin/package-form";
import {
  getPackage,
  listCategories,
  listDestinationOptions,
  listPackageDepartures,
} from "@/lib/admin-queries";
import { requireAdmin } from "@/lib/dal";
import { deletePackage, updatePackage } from "../actions";

export const metadata = { title: "Editar pacote" };

function asStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function asItinerary(value: unknown): ItineraryDay[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (v): v is ItineraryDay =>
        typeof v === "object" &&
        v !== null &&
        typeof (v as ItineraryDay).day === "number" &&
        typeof (v as ItineraryDay).title === "string" &&
        typeof (v as ItineraryDay).description === "string",
    )
    .sort((a, b) => a.day - b.day);
}

export default async function EditarPacote(props: PageProps<"/admin/pacotes/[id]">) {
  await requireAdmin();

  const [{ id }, searchParams] = await Promise.all([props.params, props.searchParams]);
  const packageId = Number(id);
  if (!Number.isInteger(packageId)) notFound();

  const [pkg, destinations, categories, departures] = await Promise.all([
    getPackage(packageId),
    listDestinationOptions(),
    listCategories(),
    listPackageDepartures(packageId),
  ]);
  if (!pkg) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/pacotes"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Pacotes
      </Link>

      {(searchParams.ok === "criado" || searchParams.ok === "salvo") && (
        <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 className="size-4 shrink-0" />
          {searchParams.ok === "criado"
            ? "Pacote criado. Agora cadastre as fotos e as datas de saída."
            : "Alterações salvas."}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{pkg.title}</h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/pacotes/${pkg.slug}`}
            target="_blank"
            className="text-sm text-brand hover:underline"
          >
            Ver no site
          </Link>
          <form action={deletePackage}>
            <input type="hidden" name="id" value={pkg.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="size-4" />
              Excluir
            </button>
          </form>
        </div>
      </div>

      <section className="rounded-2xl bg-surface p-6 ring-1 ring-border">
        <PackageForm
          action={updatePackage.bind(null, pkg.id)}
          destinations={destinations}
          categories={categories}
          submitLabel="Salvar alterações"
          initial={{
            title: pkg.title,
            shortDescription: pkg.shortDescription,
            description: pkg.description,
            price: pkg.price ? pkg.price.toString() : null,
            durationDays: pkg.durationDays,
            departureCity: pkg.departureCity,
            coverImage: pkg.coverImage,
            destinationId: pkg.destinationId,
            categoryId: pkg.categoryId,
            included: asStringList(pkg.included),
            notIncluded: asStringList(pkg.notIncluded),
            itinerary: asItinerary(pkg.itinerary),
            featured: pkg.featured,
            active: pkg.active,
          }}
        />
      </section>

      <section className="rounded-2xl bg-surface p-6 ring-1 ring-border">
        <h2 className="mb-4 font-semibold">Datas de saída</h2>
        <DepartureManager
          packageId={pkg.id}
          basePrice={pkg.price ? pkg.price.toString() : null}
          departures={departures.map((d) => ({
            id: d.id,
            departureDate: d.departureDate,
            returnDate: d.returnDate,
            spotsTotal: d.spotsTotal,
            spotsAvailable: d.spotsAvailable,
            price: d.price ? d.price.toString() : null,
            isPast: d.isPast,
          }))}
        />
      </section>

      <section className="rounded-2xl bg-surface p-6 ring-1 ring-border">
        <h2 className="mb-1 font-semibold">Galeria</h2>
        <p className="mb-4 text-sm text-muted">
          Fotos extras que aparecem na página do pacote, além da capa.
        </p>
        <GalleryManager packageId={pkg.id} images={pkg.images} />
      </section>
    </div>
  );
}
