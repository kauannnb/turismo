import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PackageForm } from "@/components/admin/package-form";
import { listCategories, listDestinationOptions } from "@/lib/admin-queries";
import { requireAdmin } from "@/lib/dal";
import { createPackage } from "../actions";

export const metadata = { title: "Novo pacote" };

export default async function NovoPacote() {
  await requireAdmin();
  const [destinations, categories] = await Promise.all([
    listDestinationOptions(),
    listCategories(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/pacotes"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Pacotes
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Novo pacote</h1>
        <p className="text-sm text-muted">
          Depois de criar, você cadastra as fotos da galeria e as datas de saída.
        </p>
      </div>

      <div className="rounded-2xl bg-surface p-6 ring-1 ring-border">
        <PackageForm
          action={createPackage}
          destinations={destinations}
          categories={categories}
          submitLabel="Criar pacote"
        />
      </div>
    </div>
  );
}
