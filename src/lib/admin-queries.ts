import "server-only";
import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const now = new Date();

  const [destinations, packagesTotal, packagesActive, upcomingDepartures, nextDepartures, semSaida] =
    await Promise.all([
      prisma.destination.count(),
      prisma.package.count(),
      prisma.package.count({ where: { active: true } }),
      prisma.departure.count({ where: { departureDate: { gte: now } } }),
      prisma.departure.findMany({
        where: { departureDate: { gte: now } },
        orderBy: { departureDate: "asc" },
        take: 6,
        include: { package: { select: { title: true, slug: true } } },
      }),
      prisma.package.count({
        where: { active: true, departures: { none: { departureDate: { gte: now } } } },
      }),
    ]);

  return {
    destinations,
    packagesTotal,
    packagesActive,
    upcomingDepartures,
    nextDepartures,
    semSaida,
  };
}

export function listDestinations() {
  return prisma.destination.findMany({
    orderBy: [{ featured: "desc" }, { name: "asc" }],
    include: { _count: { select: { packages: true } } },
  });
}

export function getDestination(id: number) {
  return prisma.destination.findUnique({ where: { id } });
}

export function listPackages() {
  return prisma.package.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      destination: { select: { name: true, state: true } },
      category: { select: { name: true } },
      _count: { select: { departures: true, images: true } },
    },
  });
}

export function getPackage(id: number) {
  // As saídas vêm de listPackageDepartures, que também marca as passadas.
  return prisma.package.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });
}

export function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export function listDestinationOptions() {
  return prisma.destination.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, state: true },
  });
}

/**
 * "Já passou?" depende da hora atual, e chamar `Date.now()` dentro de um
 * componente viola as regras de pureza do React. Por isso o corte de tempo
 * é resolvido aqui, na camada de dados, e os componentes só leem booleanos.
 */
export async function listDeparturesGrouped() {
  const now = new Date();

  const [upcoming, pastCount] = await Promise.all([
    prisma.departure.findMany({
      where: { departureDate: { gte: now } },
      orderBy: { departureDate: "asc" },
      include: { package: { select: { id: true, title: true, slug: true } } },
    }),
    prisma.departure.count({ where: { departureDate: { lt: now } } }),
  ]);

  return { upcoming, pastCount };
}

/** Saídas de um pacote, já marcadas como passadas ou futuras. */
export async function listPackageDepartures(packageId: number) {
  const now = Date.now();
  const departures = await prisma.departure.findMany({
    where: { packageId },
    orderBy: { departureDate: "asc" },
  });
  return departures.map((d) => ({ ...d, isPast: d.departureDate.getTime() < now }));
}
