import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

/**
 * Precisa ser função, não constante: como constante, o `new Date()` seria
 * avaliado uma única vez, quando o módulo carrega. Num processo que fica
 * dias no ar sob PM2, o corte de "saídas futuras" congelaria no momento do
 * deploy e o site passaria a anunciar datas que já passaram.
 */
export function packageCardSelect() {
  return {
    id: true,
    title: true,
    slug: true,
    shortDescription: true,
    price: true,
    durationDays: true,
    departureCity: true,
    coverImage: true,
    featured: true,
    destination: { select: { name: true, slug: true, state: true } },
    category: { select: { name: true, slug: true } },
    departures: {
      where: { departureDate: { gte: new Date() } },
      orderBy: { departureDate: "asc" },
      take: 1,
      select: { departureDate: true, spotsAvailable: true },
    },
  } satisfies Prisma.PackageSelect;
}

export type PackageCardData = Prisma.PackageGetPayload<{
  select: ReturnType<typeof packageCardSelect>;
}>;

export function getAllDestinations() {
  return prisma.destination.findMany({
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    include: { _count: { select: { packages: { where: { active: true } } } } },
  });
}

export function getFeaturedDestinations() {
  return prisma.destination.findMany({
    where: { featured: true },
    orderBy: { name: "asc" },
    include: { _count: { select: { packages: { where: { active: true } } } } },
  });
}

export function searchDestinations(q: string) {
  return prisma.destination.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { state: { contains: q } },
        { region: { contains: q } },
      ],
    },
    orderBy: { name: "asc" },
    include: { _count: { select: { packages: { where: { active: true } } } } },
  });
}

export function getDestinationBySlug(slug: string) {
  return prisma.destination.findUnique({ where: { slug } });
}

export function getFeaturedPackages(take = 6) {
  return prisma.package.findMany({
    where: { active: true, featured: true },
    orderBy: { createdAt: "desc" },
    take,
    select: packageCardSelect(),
  });
}

export type PackageFilters = {
  category?: string;
  month?: string;
  maxPrice?: number;
  sort?: "price-asc" | "price-desc" | "duration" | "recent";
};

export function getPackagesByDestination(destinationId: number, filters: PackageFilters) {
  const where: Prisma.PackageWhereInput = { active: true, destinationId };

  if (filters.category) where.category = { slug: filters.category };
  if (filters.maxPrice) where.price = { lte: filters.maxPrice };
  if (filters.month) {
    const [year, month] = filters.month.split("-").map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    where.departures = { some: { departureDate: { gte: start, lt: end } } };
  }

  const orderBy: Prisma.PackageOrderByWithRelationInput =
    filters.sort === "price-asc"
      ? { price: "asc" }
      : filters.sort === "price-desc"
        ? { price: "desc" }
        : filters.sort === "duration"
          ? { durationDays: "asc" }
          : { createdAt: "desc" };

  return prisma.package.findMany({ where, orderBy, select: packageCardSelect() });
}

export function getPackageBySlug(slug: string) {
  return prisma.package.findUnique({
    where: { slug },
    include: {
      destination: true,
      category: true,
      images: { orderBy: { order: "asc" } },
      departures: {
        where: { departureDate: { gte: new Date() } },
        orderBy: { departureDate: "asc" },
      },
      testimonials: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });
}

export function getRelatedPackages(destinationId: number, excludeId: number, take = 3) {
  return prisma.package.findMany({
    where: { active: true, destinationId, id: { not: excludeId } },
    take,
    select: packageCardSelect(),
  });
}

export function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export function getTestimonials(take = 6) {
  return prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: { package: { select: { title: true, slug: true } } },
  });
}

export async function getUpcomingMonths(destinationId: number) {
  const departures = await prisma.departure.findMany({
    where: { departureDate: { gte: new Date() }, package: { destinationId, active: true } },
    select: { departureDate: true },
    orderBy: { departureDate: "asc" },
  });
  const seen = new Set<string>();
  return departures
    .map((d) => d.departureDate)
    .filter((date) => {
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
