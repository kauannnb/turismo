"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug, type FormState } from "@/lib/form";
import { resolveImageField } from "@/lib/uploads";

/**
 * Só nome e estado são obrigatórios. O resto entra vazio e se completa
 * depois — a ideia é conseguir cadastrar um destino em dez segundos.
 * `vazio()` transforma string em branco em null, que é o que o banco espera.
 */
const vazio = (v: unknown) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" ? null : s;
};

const DestinationSchema = z.object({
  name: z.string().trim().min(2, { error: "Informe o nome do destino." }),
  state: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, { error: "Use a sigla com 2 letras (ex.: SP)." }),
  region: z.string().nullable(),
  description: z.string().nullable(),
  featured: z.boolean(),
});

function parse(formData: FormData) {
  return DestinationSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    state: String(formData.get("state") ?? ""),
    region: vazio(formData.get("region")),
    description: vazio(formData.get("description")),
    featured: formData.get("featured") === "on",
  });
}

/** Revalida o que depende de destinos. A home é estática, então sem isto
 *  um destino novo só apareceria nela no próximo ciclo de revalidação. */
function revalidateDestinations(slug?: string) {
  revalidatePath("/");
  revalidatePath("/destinos");
  if (slug) revalidatePath(`/destinos/${slug}`);
}

export async function createDestination(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const image = await resolveImageField(formData, "coverImage");
  if ("error" in image) return { fieldErrors: { coverImage: [image.error] } };

  // O slug sai do nome. Se já existir, ganha sufixo — assim dois destinos
  // com o mesmo nome não travam o cadastro com erro de chave única.
  const slug = await uniqueSlug(slugify(parsed.data.name), (s) =>
    prisma.destination.findUnique({ where: { slug: s }, select: { id: true } }),
  );

  const created = await prisma.destination.create({
    data: { ...parsed.data, slug, coverImage: image.value },
    select: { id: true },
  });

  revalidateDestinations(slug);
  redirect(`/admin/destinos/${created.id}?ok=criado`);
}

export async function updateDestination(
  id: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const image = await resolveImageField(formData, "coverImage");
  if ("error" in image) return { fieldErrors: { coverImage: [image.error] } };

  const before = await prisma.destination.findUnique({ where: { id }, select: { slug: true } });

  await prisma.destination.update({
    where: { id },
    data: { ...parsed.data, coverImage: image.value },
  });

  if (before) revalidatePath(`/destinos/${before.slug}`);
  revalidateDestinations(before?.slug);
  redirect(`/admin/destinos/${id}?ok=salvo`);
}

export async function deleteDestination(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  const destination = await prisma.destination.findUnique({
    where: { id },
    select: { slug: true, _count: { select: { packages: true } } },
  });
  if (!destination) return;

  // Package.destinationId não tem onDelete cascade: apagar um destino com
  // pacotes explodiria em erro de chave estrangeira. Melhor barrar antes.
  if (destination._count.packages > 0) {
    redirect(`/admin/destinos?erro=com-pacotes`);
  }

  await prisma.destination.delete({ where: { id } });
  revalidateDestinations(destination.slug);
  redirect("/admin/destinos?ok=removido");
}
