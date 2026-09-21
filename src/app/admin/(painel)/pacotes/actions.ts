"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as z from "zod";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { slugify, uniqueSlug, type FormState } from "@/lib/form";
import { resolveImageField, saveUpload } from "@/lib/uploads";

/**
 * Campo Json anulável no Prisma não aceita `null` direto — isso seria
 * ambíguo entre "NULL no banco" e "o valor JSON null". `Prisma.DbNull`
 * é o que grava NULL de verdade.
 */
function jsonOuNulo(value: unknown[] | null) {
  return value === null ? Prisma.DbNull : (value as Prisma.InputJsonValue);
}

/**
 * Só título e destino são obrigatórios. Um pacote nasce como rascunho e vai
 * sendo completado — por isso quase tudo aceita vazio e vira null.
 */
const vazio = (v: unknown) => {
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" ? null : s;
};

/** Campo numérico que aceita vazio. `""` vira null em vez de erro. */
const numeroOpcional = (opts: { inteiro?: boolean; max?: number; erro: string }) =>
  z.union([
    z.literal("").transform(() => null),
    z.literal("null").transform(() => null),
    (() => {
      let n = z.coerce.number({ error: opts.erro }).positive({ error: opts.erro });
      if (opts.inteiro) n = n.int({ error: opts.erro });
      if (opts.max) n = n.max(opts.max, { error: opts.erro });
      return n;
    })(),
  ]);

const PackageSchema = z.object({
  title: z.string().trim().min(3, { error: "Informe o título do pacote." }),
  destinationId: z.coerce.number().int().positive({ error: "Escolha o destino." }),
  categoryId: z.union([
    z.literal("").transform(() => null),
    z.coerce.number().int().positive(),
  ]),
  shortDescription: z
    .string()
    .trim()
    .max(200, { error: "A chamada deve ter no máximo 200 caracteres." })
    .nullable(),
  description: z.string().nullable(),
  price: numeroOpcional({ max: 99_999_999, erro: "Informe um preço válido ou deixe vazio." }),
  durationDays: numeroOpcional({
    inteiro: true,
    max: 90,
    erro: "Informe a duração em dias (1 a 90) ou deixe vazio.",
  }),
  departureCity: z.string().nullable(),
  included: z.array(z.string()).nullable(),
  notIncluded: z.array(z.string()).nullable(),
  itinerary: z
    .array(
      z.object({
        day: z.number().int().positive(),
        title: z.string().trim(),
        description: z.string().trim(),
      }),
    )
    .nullable(),
  featured: z.boolean(),
  active: z.boolean(),
});

/** Textarea com um item por linha → array, descartando linhas vazias. */
function lines(value: FormDataEntryValue | null) {
  const list = String(value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return list.length > 0 ? list : null;
}

function parse(formData: FormData) {
  let itinerary: unknown = null;
  try {
    // O formulário manda o roteiro como JSON num campo oculto: é uma lista
    // de objetos, não dá para representar bem em campos soltos.
    const raw = JSON.parse(String(formData.get("itinerary") ?? "[]"));
    itinerary = Array.isArray(raw) && raw.length > 0 ? raw : null;
  } catch {
    itinerary = null;
  }

  return PackageSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    destinationId: String(formData.get("destinationId") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    shortDescription: vazio(formData.get("shortDescription")),
    description: vazio(formData.get("description")),
    price: String(formData.get("price") ?? ""),
    durationDays: String(formData.get("durationDays") ?? ""),
    departureCity: vazio(formData.get("departureCity")),
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

  const image = await resolveImageField(formData, "coverImage");
  if ("error" in image) return { fieldErrors: { coverImage: [image.error] } };

  const slug = await uniqueSlug(slugify(parsed.data.title), (s) =>
    prisma.package.findUnique({ where: { slug: s }, select: { id: true } }),
  );

  const { included, notIncluded, itinerary, ...rest } = parsed.data;

  const created = await prisma.package.create({
    data: {
      ...rest,
      slug,
      coverImage: image.value,
      included: jsonOuNulo(included),
      notIncluded: jsonOuNulo(notIncluded),
      itinerary: jsonOuNulo(itinerary),
    },
    select: { id: true },
  });

  await revalidatePackage(slug, parsed.data.destinationId);
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

  const image = await resolveImageField(formData, "coverImage");
  if ("error" in image) return { fieldErrors: { coverImage: [image.error] } };

  const before = await prisma.package.findUnique({
    where: { id },
    select: { slug: true, destinationId: true },
  });

  const { included, notIncluded, itinerary, ...rest } = parsed.data;

  await prisma.package.update({
    where: { id },
    data: {
      ...rest,
      coverImage: image.value,
      included: jsonOuNulo(included),
      notIncluded: jsonOuNulo(notIncluded),
      itinerary: jsonOuNulo(itinerary),
    },
  });

  if (before) {
    await revalidatePackage(before.slug, before.destinationId);
    // Mudou de destino? A página do destino antigo também precisa atualizar.
    if (before.destinationId !== parsed.data.destinationId) {
      await revalidatePackage(before.slug, parsed.data.destinationId);
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

export async function addPackageImages(
  packageId: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const files = formData.getAll("fotos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return { error: "Escolha pelo menos uma imagem." };
  }

  const last = await prisma.packageImage.findFirst({
    where: { packageId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  let order = (last?.order ?? 0) + 1;

  const falhas: string[] = [];

  for (const file of files) {
    const saved = await saveUpload(file);
    if ("error" in saved) {
      falhas.push(`${file.name}: ${saved.error}`);
      continue;
    }
    await prisma.packageImage.create({
      data: { url: saved.url, alt: "", packageId, order: order++ },
    });
  }

  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    select: { slug: true },
  });
  if (pkg) revalidatePath(`/pacotes/${pkg.slug}`);
  revalidatePath(`/admin/pacotes/${packageId}`);

  // Parciais contam: as que deram certo já foram gravadas.
  return falhas.length > 0 ? { error: falhas.join(" · ") } : undefined;
}

export async function updateImageAlt(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  const image = await prisma.packageImage.update({
    where: { id },
    data: { alt: String(formData.get("alt") ?? "").trim().slice(0, 180) },
    select: { packageId: true, package: { select: { slug: true } } },
  });

  revalidatePath(`/pacotes/${image.package.slug}`);
  revalidatePath(`/admin/pacotes/${image.packageId}`);
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
