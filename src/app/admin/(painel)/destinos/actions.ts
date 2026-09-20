"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import {
  ALLOWED_IMAGE_HOSTS,
  isAllowedImageUrl,
  isUniqueViolation,
  slugify,
  type FormState,
} from "@/lib/form";

const DestinationSchema = z.object({
  name: z.string().trim().min(2, { error: "Informe o nome do destino." }),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, { error: "Use apenas letras minúsculas, números e hífen." }),
  state: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, { error: "Use a sigla com 2 letras (ex.: SP)." }),
  region: z.string().trim().min(2, { error: "Informe a região." }),
  description: z.string().trim().min(20, { error: "Descreva o destino em pelo menos 20 caracteres." }),
  coverImage: z.string().trim().refine(isAllowedImageUrl, {
    error: `A imagem precisa ser uma URL https de: ${ALLOWED_IMAGE_HOSTS.join(", ")}.`,
  }),
  featured: z.boolean(),
});

function parse(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const rawSlug = String(formData.get("slug") ?? "").trim();

  return DestinationSchema.safeParse({
    name,
    // Slug vazio é preenchido a partir do nome, em vez de recusar o envio.
    slug: rawSlug ? slugify(rawSlug) : slugify(name),
    state: String(formData.get("state") ?? ""),
    region: String(formData.get("region") ?? ""),
    description: String(formData.get("description") ?? ""),
    coverImage: String(formData.get("coverImage") ?? ""),
    featured: formData.get("featured") === "on",
  });
}

/** Revalida o que depende de destinos. A home é estática, então sem isto
 *  um destino novo só apareceria nela no próximo build. */
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

  try {
    await prisma.destination.create({ data: parsed.data });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { fieldErrors: { slug: ["Já existe um destino com esse endereço (slug)."] } };
    }
    throw err;
  }

  revalidateDestinations(parsed.data.slug);
  redirect("/admin/destinos");
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

  const before = await prisma.destination.findUnique({ where: { id }, select: { slug: true } });

  try {
    await prisma.destination.update({ where: { id }, data: parsed.data });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { fieldErrors: { slug: ["Já existe um destino com esse endereço (slug)."] } };
    }
    throw err;
  }

  revalidateDestinations(parsed.data.slug);
  // Se o slug mudou, a página antiga também precisa sair do cache.
  if (before && before.slug !== parsed.data.slug) revalidatePath(`/destinos/${before.slug}`);
  redirect("/admin/destinos");
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
