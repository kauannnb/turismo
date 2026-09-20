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

const imageUrl = z.string().trim().refine(isAllowedImageUrl, {
  error: `A imagem precisa ser uma URL https de: ${ALLOWED_IMAGE_HOSTS.join(", ")}.`,
});

const PackageSchema = z.object({
  title: z.string().trim().min(3, { error: "Informe o título do pacote." }),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, { error: "Use apenas letras minúsculas, números e hífen." }),
  shortDescription: z
    .string()
    .trim()
    .min(10, { error: "Escreva uma chamada de pelo menos 10 caracteres." })
    .max(200, { error: "A chamada deve ter no máximo 200 caracteres." }),
  description: z.string().trim().min(30, { error: "Descreva o pacote com mais detalhe." }),
  price: z.coerce
    .number({ error: "Informe um preço válido." })
    .positive({ error: "O preço deve ser maior que zero." })
    .max(99_999_999, { error: "Preço acima do limite." }),
  durationDays: z.coerce
    .number({ error: "Informe a duração." })
    .int({ error: "A duração deve ser um número inteiro de dias." })
    .min(1, { error: "Mínimo de 1 dia." })
    .max(90, { error: "Máximo de 90 dias." }),
  departureCity: z.string().trim().min(2, { error: "Informe a cidade de saída." }),
  coverImage: imageUrl,
  destinationId: z.coerce.number().int().positive({ error: "Escolha o destino." }),
  categoryId: z.coerce.number().int().positive({ error: "Escolha a categoria." }),
  included: z.array(z.string().trim().min(1)),
  notIncluded: z.array(z.string().trim().min(1)),
  itinerary: z.array(
    z.object({
      day: z.number().int().positive(),
      title: z.string().trim().min(1, { error: "Cada dia do roteiro precisa de um título." }),
      description: z.string().trim().min(1, { error: "Descreva o que acontece no dia." }),
    }),
  ),
  featured: z.boolean(),
  active: z.boolean(),
});

/** Textarea com um item por linha → array, descartando linhas vazias. */
function lines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function parse(formData: FormData) {
  const title = String(formData.get("title") ?? "");
  const rawSlug = String(formData.get("slug") ?? "").trim();

  let itinerary: unknown = [];
  try {
    // O formulário manda o roteiro como JSON num campo oculto: é uma lista de
    // objetos, não dá para representar bem em campos soltos.
    itinerary = JSON.parse(String(formData.get("itinerary") ?? "[]"));
  } catch {
    itinerary = [];
  }

  return PackageSchema.safeParse({
    title,
    slug: rawSlug ? slugify(rawSlug) : slugify(title),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: String(formData.get("price") ?? ""),
    durationDays: String(formData.get("durationDays") ?? ""),
    departureCity: String(formData.get("departureCity") ?? ""),
    coverImage: String(formData.get("coverImage") ?? ""),
    destinationId: String(formData.get("destinationId") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    included: lines(formData.get("included")),
    notIncluded: lines(formData.get("notIncluded")),
    itinerary,
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
  });
}

async function revalidatePackage(slug: string, destinationId: number) {
  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
    select: { slug: true },
  });
  revalidatePath("/");
  revalidatePath("/destinos");
  if (destination) revalidatePath(`/destinos/${destination.slug}`);
  revalidatePath(`/pacotes/${slug}`);
}

export async function createPackage(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  let created;
  try {
    created = await prisma.package.create({ data: parsed.data, select: { id: true } });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { fieldErrors: { slug: ["Já existe um pacote com esse endereço (slug)."] } };
    }
    throw err;
  }

  await revalidatePackage(parsed.data.slug, parsed.data.destinationId);
  // Vai direto para a edição: é lá que se cadastram fotos e datas de saída.
  redirect(`/admin/pacotes/${created.id}?ok=criado`);
}

export async function updatePackage(
  id: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const before = await prisma.package.findUnique({
    where: { id },
    select: { slug: true, destinationId: true },
  });

  try {
    await prisma.package.update({ where: { id }, data: parsed.data });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { fieldErrors: { slug: ["Já existe um pacote com esse endereço (slug)."] } };
    }
    throw err;
  }

  await revalidatePackage(parsed.data.slug, parsed.data.destinationId);
  if (before) {
    if (before.slug !== parsed.data.slug) revalidatePath(`/pacotes/${before.slug}`);
    // Mudou de destino? A página do destino antigo também precisa atualizar.
    if (before.destinationId !== parsed.data.destinationId) {
      await revalidatePackage(parsed.data.slug, before.destinationId);
    }
  }

  redirect(`/admin/pacotes/${id}?ok=salvo`);
}

export async function deletePackage(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  const pkg = await prisma.package.findUnique({
    where: { id },
    select: { slug: true, destinationId: true },
  });
  if (!pkg) return;

  // Imagens e saídas têm onDelete: Cascade no schema; depoimentos usam
  // SetNull. Então apagar o pacote não deixa órfãos nem estoura FK.
  await prisma.package.delete({ where: { id } });

  await revalidatePackage(pkg.slug, pkg.destinationId);
  redirect("/admin/pacotes?ok=removido");
}

// --- Fotos da galeria -------------------------------------------------------

const ImageSchema = z.object({
  url: imageUrl,
  alt: z.string().trim().min(3, { error: "Descreva a foto (acessibilidade e SEO)." }),
});

export async function addPackageImage(
  packageId: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const parsed = ImageSchema.safeParse({
    url: String(formData.get("url") ?? ""),
    alt: String(formData.get("alt") ?? ""),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const last = await prisma.packageImage.findFirst({
    where: { packageId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await prisma.packageImage.create({
    data: { ...parsed.data, packageId, order: (last?.order ?? 0) + 1 },
  });

  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    select: { slug: true },
  });
  if (pkg) revalidatePath(`/pacotes/${pkg.slug}`);
  revalidatePath(`/admin/pacotes/${packageId}`);
  return undefined;
}

export async function removePackageImage(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  const image = await prisma.packageImage.delete({
    where: { id },
    select: { packageId: true, package: { select: { slug: true } } },
  });

  revalidatePath(`/pacotes/${image.package.slug}`);
  revalidatePath(`/admin/pacotes/${image.packageId}`);
}
