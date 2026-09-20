"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import type { FormState } from "@/lib/form";

/**
 * O input `type="date"` devolve "AAAA-MM-DD" sem horário. Se gravássemos
 * como meia-noite UTC, a exibição em America/Sao_Paulo (UTC-3) mostraria o
 * dia anterior. Fixar meio-dia UTC deixa a data igual nos dois fusos.
 */
function toUtcNoon(value: string) {
  return new Date(`${value}T12:00:00.000Z`);
}

const DepartureSchema = z
  .object({
    packageId: z.coerce.number().int().positive({ error: "Escolha o pacote." }),
    departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Informe a data de saída." }),
    returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Informe a data de retorno." }),
    spotsTotal: z.coerce
      .number()
      .int()
      .min(1, { error: "Informe o total de vagas." })
      .max(500, { error: "Total de vagas acima do limite." }),
    // Vazio significa "todas livres" — o caso comum ao abrir uma data nova.
    spotsAvailable: z.union([
      z.literal("").transform(() => null),
      z.coerce.number().int().min(0, { error: "Vagas disponíveis não pode ser negativo." }),
    ]),
    price: z.union([z.literal(""), z.coerce.number().positive()]).optional(),
  })
  .transform((d) => ({
    ...d,
    spotsAvailable: d.spotsAvailable ?? d.spotsTotal,
  }))
  .refine((d) => d.returnDate >= d.departureDate, {
    error: "O retorno não pode ser antes da saída.",
    path: ["returnDate"],
  })
  .refine((d) => d.spotsAvailable <= d.spotsTotal, {
    error: "Vagas disponíveis não podem passar do total.",
    path: ["spotsAvailable"],
  });

function parse(formData: FormData) {
  return DepartureSchema.safeParse({
    packageId: String(formData.get("packageId") ?? ""),
    departureDate: String(formData.get("departureDate") ?? ""),
    returnDate: String(formData.get("returnDate") ?? ""),
    spotsTotal: String(formData.get("spotsTotal") ?? ""),
    spotsAvailable: String(formData.get("spotsAvailable") ?? ""),
    price: String(formData.get("price") ?? ""),
  });
}

async function revalidateForPackage(packageId: number) {
  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
    select: { slug: true, destination: { select: { slug: true } } },
  });
  if (!pkg) return;
  revalidatePath("/");
  revalidatePath(`/pacotes/${pkg.slug}`);
  revalidatePath(`/destinos/${pkg.destination.slug}`);
  revalidatePath(`/admin/pacotes/${packageId}`);
  revalidatePath("/admin/saidas");
}

export async function createDeparture(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { departureDate, returnDate, price, ...rest } = parsed.data;

  await prisma.departure.create({
    data: {
      ...rest,
      departureDate: toUtcNoon(departureDate),
      returnDate: toUtcNoon(returnDate),
      price: price === "" || price === undefined ? null : price,
    },
  });

  await revalidateForPackage(parsed.data.packageId);
  return undefined;
}

export async function updateDeparture(
  id: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const parsed = parse(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { departureDate, returnDate, price, ...rest } = parsed.data;

  await prisma.departure.update({
    where: { id },
    data: {
      ...rest,
      departureDate: toUtcNoon(departureDate),
      returnDate: toUtcNoon(returnDate),
      price: price === "" || price === undefined ? null : price,
    },
  });

  await revalidateForPackage(parsed.data.packageId);
  return undefined;
}

export async function deleteDeparture(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;

  const departure = await prisma.departure.delete({
    where: { id },
    select: { packageId: true },
  });

  await revalidateForPackage(departure.packageId);
}
