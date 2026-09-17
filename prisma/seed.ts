import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

const destinations = [
  {
    name: "Gramado",
    slug: "gramado",
    state: "RS",
    region: "Sul",
    featured: true,
    coverImage: img("photo-1544025162-d76694265947"),
    description:
      "Charme europeu na Serra Gaúcha: chocolate artesanal, arquitetura bávara, Natal Luz e paisagens de tirar o fôlego.",
  },
  {
    name: "Bonito",
    slug: "bonito",
    state: "MS",
    region: "Centro-Oeste",
    featured: true,
    coverImage: img("photo-1469474968028-56623f02e42e"),
    description:
      "Rios de águas cristalinas, flutuação entre peixes coloridos, grutas e cachoeiras no coração do Mato Grosso do Sul.",
  },
  {
    name: "Foz do Iguaçu",
    slug: "foz-do-iguacu",
    state: "PR",
    region: "Sul",
    featured: true,
    coverImage: img("photo-1483729558449-99ef09a8c325"),
    description:
      "As Cataratas mais impressionantes do mundo, Itaipu, Parque das Aves e a tríplice fronteira.",
  },
  {
    name: "Porto de Galinhas",
    slug: "porto-de-galinhas",
    state: "PE",
    region: "Nordeste",
    featured: true,
    coverImage: img("photo-1507525428034-b723cf961d3e"),
    description:
      "Piscinas naturais de água morna, jangadas e praias de areia branca no litoral pernambucano.",
  },
  {
    name: "Rio de Janeiro",
    slug: "rio-de-janeiro",
    state: "RJ",
    region: "Sudeste",
    featured: true,
    coverImage: img("photo-1483729558449-99ef09a8c325"),
    description:
      "Cristo Redentor, Pão de Açúcar, Copacabana e o jeito carioca de viver: a Cidade Maravilhosa.",
  },
  {
    name: "Chapada Diamantina",
    slug: "chapada-diamantina",
    state: "BA",
    region: "Nordeste",
    featured: true,
    coverImage: img("photo-1501785888041-af3ef285b470"),
    description:
      "Trilhas, cachoeiras gigantes, grutas azuis e o Vale do Pati: o paraíso do ecoturismo baiano.",
  },
  {
    name: "Campos do Jordão",
    slug: "campos-do-jordao",
    state: "SP",
    region: "Sudeste",
    featured: false,
    coverImage: img("photo-1470770903676-69b98201ea1c"),
    description:
      "A Suíça brasileira: clima de montanha, fondue, teleférico e o Festival de Inverno.",
  },
  {
    name: "Jericoacoara",
    slug: "jericoacoara",
    state: "CE",
    region: "Nordeste",
    featured: false,
    coverImage: img("photo-1519046904884-53103b34b206"),
    description:
      "Dunas, lagoas de água doce, pôr do sol na Duna e a Pedra Furada: um vilarejo mágico no Ceará.",
  },
];

const categories = [
  { name: "Pacote completo", slug: "pacote-completo" },
  { name: "Bate-volta", slug: "bate-volta" },
  { name: "Ecoturismo", slug: "ecoturismo" },
  { name: "Praia", slug: "praia" },
  { name: "Serra e montanha", slug: "serra-e-montanha" },
  { name: "Cultural", slug: "cultural" },
];

type PackageSeed = {
  destination: string;
  category: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  durationDays: number;
  departureCity: string;
  coverImage: string;
  featured: boolean;
  included: string[];
  notIncluded: string[];
  itinerary: { day: number; title: string; description: string }[];
  images: string[];
  departures: { start: string; end: string; spots: number }[];
};

const packages: PackageSeed[] = [
  {
    destination: "gramado",
    category: "pacote-completo",
    title: "Gramado e Canela: Natal Luz",
    slug: "gramado-canela-natal-luz",
    shortDescription:
      "4 dias na Serra Gaúcha com espetáculos do Natal Luz, Mini Mundo e Lago Negro.",
    description:
      "Viva a magia do Natal Luz em Gramado com transporte confortável, hotel bem localizado e roteiro completo pelos principais pontos de Gramado e Canela. Inclui ingressos para o espetáculo Nativitaten e passeio pela Rota Romântica.",
    price: 1890,
    durationDays: 4,
    departureCity: "São Paulo, SP",
    coverImage: img("photo-1544025162-d76694265947"),
    featured: true,
    included: [
      "Transporte em ônibus leito-turismo",
      "3 diárias em hotel 3 estrelas com café da manhã",
      "Ingresso para o espetáculo Nativitaten",
      "City tour Gramado e Canela",
      "Guia acompanhante",
    ],
    notIncluded: ["Almoços e jantares", "Ingressos não mencionados", "Despesas pessoais"],
    itinerary: [
      { day: 1, title: "Saída e chegada", description: "Saída à noite de São Paulo. Chegada em Gramado no final da tarde, check-in e noite livre." },
      { day: 2, title: "Gramado", description: "City tour: Lago Negro, Mini Mundo, Rua Coberta e fábricas de chocolate. À noite, espetáculo Nativitaten." },
      { day: 3, title: "Canela", description: "Catedral de Pedra, Cascata do Caracol e Parque do Caracol. Tarde livre." },
      { day: 4, title: "Retorno", description: "Café da manhã, check-out e retorno para São Paulo." },
    ],
    images: [img("photo-1544025162-d76694265947"), img("photo-1470770903676-69b98201ea1c")],
    departures: [
      { start: "2026-11-20", end: "2026-11-23", spots: 44 },
      { start: "2026-12-04", end: "2026-12-07", spots: 44 },
      { start: "2026-12-18", end: "2026-12-21", spots: 44 },
    ],
  },
  {
    destination: "bonito",
    category: "ecoturismo",
    title: "Bonito: Flutuação e Grutas",
    slug: "bonito-flutuacao-grutas",
    shortDescription:
      "5 dias de águas cristalinas: Rio da Prata, Gruta do Lago Azul e Abismo Anhumas.",
    description:
      "O roteiro definitivo para conhecer Bonito. Flutuação no Rio da Prata, visita à Gruta do Lago Azul, Balneário Municipal e Boca da Onça. Hospedagem em pousada com piscina e todos os transfers entre atrativos inclusos.",
    price: 3290,
    durationDays: 5,
    departureCity: "Campo Grande, MS",
    coverImage: img("photo-1469474968028-56623f02e42e"),
    featured: true,
    included: [
      "Transfer aeroporto Campo Grande – Bonito – aeroporto",
      "4 diárias em pousada com café da manhã",
      "Flutuação Rio da Prata com equipamentos",
      "Gruta do Lago Azul",
      "Balneário Municipal",
      "Guia local credenciado",
    ],
    notIncluded: ["Passagens aéreas", "Refeições não mencionadas", "Abismo Anhumas (opcional)"],
    itinerary: [
      { day: 1, title: "Chegada", description: "Recepção em Campo Grande e transfer para Bonito. Check-in e tarde livre." },
      { day: 2, title: "Rio da Prata", description: "Flutuação no Rio da Prata com almoço na fazenda." },
      { day: 3, title: "Grutas", description: "Gruta do Lago Azul pela manhã e Balneário Municipal à tarde." },
      { day: 4, title: "Boca da Onça", description: "Trilha e cachoeiras da Boca da Onça com almoço incluso." },
      { day: 5, title: "Retorno", description: "Café da manhã e transfer para o aeroporto de Campo Grande." },
    ],
    images: [img("photo-1469474968028-56623f02e42e"), img("photo-1501785888041-af3ef285b470")],
    departures: [
      { start: "2026-10-10", end: "2026-10-14", spots: 16 },
      { start: "2026-11-14", end: "2026-11-18", spots: 16 },
    ],
  },
  {
    destination: "foz-do-iguacu",
    category: "pacote-completo",
    title: "Foz do Iguaçu: Cataratas e Itaipu",
    slug: "foz-do-iguacu-cataratas-itaipu",
    shortDescription:
      "3 dias com Cataratas dos dois lados, Parque das Aves e Usina de Itaipu.",
    description:
      "Conheça uma das 7 maravilhas naturais do mundo. Visita às Cataratas pelo lado brasileiro e argentino, Parque das Aves, Usina de Itaipu e Marco das Três Fronteiras. Saída de Curitiba em ônibus executivo.",
    price: 1450,
    durationDays: 3,
    departureCity: "Curitiba, PR",
    coverImage: img("photo-1483729558449-99ef09a8c325"),
    featured: true,
    included: [
      "Transporte em ônibus executivo",
      "2 diárias em hotel com café da manhã",
      "Ingresso Cataratas lado brasileiro",
      "Ingresso Parque das Aves",
      "Visita panorâmica Itaipu",
      "Guia acompanhante",
    ],
    notIncluded: ["Cataratas lado argentino (opcional)", "Refeições", "Macuco Safari"],
    itinerary: [
      { day: 1, title: "Saída", description: "Saída de Curitiba pela manhã. Chegada em Foz à noite." },
      { day: 2, title: "Cataratas", description: "Cataratas lado brasileiro e Parque das Aves. Tarde: Usina de Itaipu." },
      { day: 3, title: "Três Fronteiras e retorno", description: "Marco das Três Fronteiras pela manhã e retorno para Curitiba." },
    ],
    images: [img("photo-1483729558449-99ef09a8c325")],
    departures: [
      { start: "2026-10-16", end: "2026-10-18", spots: 46 },
      { start: "2026-11-13", end: "2026-11-15", spots: 46 },
      { start: "2027-01-08", end: "2027-01-10", spots: 46 },
    ],
  },
  {
    destination: "porto-de-galinhas",
    category: "praia",
    title: "Porto de Galinhas: Piscinas Naturais",
    slug: "porto-de-galinhas-piscinas-naturais",
    shortDescription:
      "6 dias em resort pé na areia com passeio de jangada e Praia dos Carneiros.",
    description:
      "Relaxe em uma das praias mais bonitas do Brasil. Hospedagem em resort com café da manhã, passeio de jangada às piscinas naturais, buggy pelas praias e um dia inteiro na Praia dos Carneiros.",
    price: 2790,
    durationDays: 6,
    departureCity: "Recife, PE",
    coverImage: img("photo-1507525428034-b723cf961d3e"),
    featured: true,
    included: [
      "Transfer aeroporto Recife – Porto de Galinhas – aeroporto",
      "5 diárias em resort com café da manhã",
      "Passeio de jangada às piscinas naturais",
      "Passeio de buggy ponta a ponta",
      "Day use Praia dos Carneiros",
    ],
    notIncluded: ["Passagens aéreas", "Almoços e jantares", "Taxas ambientais"],
    itinerary: [
      { day: 1, title: "Chegada", description: "Transfer do aeroporto e check-in no resort." },
      { day: 2, title: "Piscinas naturais", description: "Passeio de jangada às piscinas naturais na maré baixa." },
      { day: 3, title: "Buggy", description: "Passeio de buggy ponta a ponta: Maracaípe, Muro Alto e Cupe." },
      { day: 4, title: "Praia dos Carneiros", description: "Day use na Praia dos Carneiros com igrejinha e catamarã." },
      { day: 5, title: "Dia livre", description: "Dia livre para aproveitar o resort." },
      { day: 6, title: "Retorno", description: "Café da manhã e transfer para o aeroporto." },
    ],
    images: [img("photo-1507525428034-b723cf961d3e"), img("photo-1519046904884-53103b34b206")],
    departures: [
      { start: "2026-10-05", end: "2026-10-10", spots: 20 },
      { start: "2026-12-12", end: "2026-12-17", spots: 20 },
    ],
  },
  {
    destination: "rio-de-janeiro",
    category: "cultural",
    title: "Rio de Janeiro: Cidade Maravilhosa",
    slug: "rio-de-janeiro-cidade-maravilhosa",
    shortDescription:
      "3 dias com Cristo Redentor, Pão de Açúcar, Escadaria Selarón e Copacabana.",
    description:
      "Tudo que o Rio tem de mais icônico em um fim de semana. Trem do Corcovado, bondinho do Pão de Açúcar, Lapa, Santa Teresa e uma noite de samba na Pedra do Sal.",
    price: 1290,
    durationDays: 3,
    departureCity: "São Paulo, SP",
    coverImage: img("photo-1483729558449-99ef09a8c325"),
    featured: false,
    included: [
      "Transporte em ônibus executivo",
      "2 diárias em hotel em Copacabana com café da manhã",
      "Ingresso Trem do Corcovado",
      "Ingresso Bondinho Pão de Açúcar",
      "City tour Centro Histórico e Lapa",
    ],
    notIncluded: ["Refeições", "Ingressos não mencionados"],
    itinerary: [
      { day: 1, title: "Chegada e Corcovado", description: "Chegada pela manhã, Cristo Redentor via trem do Corcovado e tarde em Copacabana." },
      { day: 2, title: "Pão de Açúcar e Centro", description: "Bondinho do Pão de Açúcar, Escadaria Selarón, Lapa e Santa Teresa. Noite na Pedra do Sal." },
      { day: 3, title: "Retorno", description: "Manhã livre na praia e retorno para São Paulo." },
    ],
    images: [img("photo-1483729558449-99ef09a8c325")],
    departures: [
      { start: "2026-10-23", end: "2026-10-25", spots: 46 },
      { start: "2026-11-27", end: "2026-11-29", spots: 46 },
    ],
  },
  {
    destination: "chapada-diamantina",
    category: "ecoturismo",
    title: "Chapada Diamantina: Trilhas e Cachoeiras",
    slug: "chapada-diamantina-trilhas-cachoeiras",
    shortDescription:
      "5 dias com Cachoeira da Fumaça, Poço Azul, Morro do Pai Inácio e Lençóis.",
    description:
      "Para quem ama natureza. Trilhas guiadas até a Cachoeira da Fumaça, banho no Poço Azul e Poço Encantado, pôr do sol no Morro do Pai Inácio e as ruas coloniais de Lençóis.",
    price: 2490,
    durationDays: 5,
    departureCity: "Salvador, BA",
    coverImage: img("photo-1501785888041-af3ef285b470"),
    featured: true,
    included: [
      "Transporte Salvador – Lençóis – Salvador",
      "4 diárias em pousada com café da manhã",
      "Todos os passeios com guia credenciado",
      "Entradas dos atrativos",
    ],
    notIncluded: ["Refeições não mencionadas", "Equipamento de trekking pessoal"],
    itinerary: [
      { day: 1, title: "Chegada em Lençóis", description: "Saída de Salvador pela manhã. Chegada, check-in e caminhada pelo centro histórico." },
      { day: 2, title: "Pai Inácio", description: "Gruta da Lapa Doce, Gruta da Pratinha e pôr do sol no Morro do Pai Inácio." },
      { day: 3, title: "Cachoeira da Fumaça", description: "Trilha de 6 km até o topo da Cachoeira da Fumaça." },
      { day: 4, title: "Poços", description: "Poço Azul e Poço Encantado com flutuação." },
      { day: 5, title: "Retorno", description: "Manhã livre e retorno para Salvador." },
    ],
    images: [img("photo-1501785888041-af3ef285b470"), img("photo-1469474968028-56623f02e42e")],
    departures: [
      { start: "2026-10-12", end: "2026-10-16", spots: 14 },
      { start: "2026-11-09", end: "2026-11-13", spots: 14 },
    ],
  },
  {
    destination: "campos-do-jordao",
    category: "bate-volta",
    title: "Campos do Jordão: Bate-volta",
    slug: "campos-do-jordao-bate-volta",
    shortDescription:
      "1 dia na Suíça brasileira: Capivari, teleférico, Morro do Elefante e Amantikir.",
    description:
      "Escapada perfeita de um dia. Saída cedo de São Paulo, dia inteiro em Campos do Jordão com teleférico, Parque Amantikir, Vila Capivari e retorno à noite.",
    price: 249,
    durationDays: 1,
    departureCity: "São Paulo, SP",
    coverImage: img("photo-1470770903676-69b98201ea1c"),
    featured: false,
    included: ["Transporte em ônibus executivo", "Ingresso Parque Amantikir", "Guia acompanhante"],
    notIncluded: ["Teleférico (opcional)", "Refeições"],
    itinerary: [
      { day: 1, title: "Campos do Jordão", description: "Saída às 6h. Parque Amantikir, Morro do Elefante, almoço livre em Capivari e retorno às 18h." },
    ],
    images: [img("photo-1470770903676-69b98201ea1c")],
    departures: [
      { start: "2026-10-03", end: "2026-10-03", spots: 46 },
      { start: "2026-10-17", end: "2026-10-17", spots: 46 },
      { start: "2026-11-07", end: "2026-11-07", spots: 46 },
    ],
  },
  {
    destination: "jericoacoara",
    category: "praia",
    title: "Jericoacoara: Dunas e Lagoas",
    slug: "jericoacoara-dunas-lagoas",
    shortDescription:
      "5 dias com Lagoa do Paraíso, Pedra Furada, pôr do sol na Duna e buggy.",
    description:
      "Jeri como deve ser: passeio de buggy pelas lagoas azuis, Pedra Furada, pôr do sol na Duna todos os dias e pousada charmosa no centro da vila.",
    price: 2990,
    durationDays: 5,
    departureCity: "Fortaleza, CE",
    coverImage: img("photo-1519046904884-53103b34b206"),
    featured: true,
    included: [
      "Transfer 4x4 Fortaleza – Jeri – Fortaleza",
      "4 diárias em pousada com café da manhã",
      "Passeio de buggy Lado Leste (Lagoa do Paraíso e Azul)",
      "Passeio de buggy Lado Oeste (Mangue Seco e Tatajuba)",
    ],
    notIncluded: ["Passagens aéreas", "Refeições", "Taxa de turismo de Jeri"],
    itinerary: [
      { day: 1, title: "Chegada", description: "Transfer 4x4 de Fortaleza. Chegada à tarde e pôr do sol na Duna." },
      { day: 2, title: "Lado Leste", description: "Buggy: Lagoa do Paraíso, Lagoa Azul e Árvore da Preguiça." },
      { day: 3, title: "Lado Oeste", description: "Buggy: Mangue Seco, Tatajuba e Lagoa da Torta." },
      { day: 4, title: "Pedra Furada", description: "Trilha até a Pedra Furada e dia livre." },
      { day: 5, title: "Retorno", description: "Café da manhã e transfer para Fortaleza." },
    ],
    images: [img("photo-1519046904884-53103b34b206"), img("photo-1507525428034-b723cf961d3e")],
    departures: [
      { start: "2026-11-02", end: "2026-11-06", spots: 12 },
      { start: "2027-01-15", end: "2027-01-19", spots: 12 },
    ],
  },
];

const testimonials = [
  { authorName: "Mariana Souza", authorCity: "Campinas, SP", rating: 5, text: "Viagem impecável para Gramado. Hotel ótimo, guia atencioso e o Natal Luz foi emocionante. Já quero repetir!", pkg: "gramado-canela-natal-luz" },
  { authorName: "Carlos Henrique", authorCity: "Curitiba, PR", rating: 5, text: "Bonito superou todas as expectativas. A flutuação no Rio da Prata é surreal. Organização nota 10.", pkg: "bonito-flutuacao-grutas" },
  { authorName: "Fernanda Lima", authorCity: "Recife, PE", rating: 5, text: "Tudo muito bem organizado, sem estresse. Os passeios em Porto de Galinhas foram incríveis.", pkg: "porto-de-galinhas-piscinas-naturais" },
  { authorName: "Roberto Alves", authorCity: "São Paulo, SP", rating: 4, text: "Bate-volta em Campos do Jordão valeu cada centavo. Ônibus confortável e roteiro bem aproveitado.", pkg: "campos-do-jordao-bate-volta" },
  { authorName: "Juliana Castro", authorCity: "Salvador, BA", rating: 5, text: "Chapada Diamantina é outro mundo. O guia conhecia cada trilha e cuidou de todo o grupo.", pkg: "chapada-diamantina-trilhas-cachoeiras" },
  { authorName: "Pedro Martins", authorCity: "Belo Horizonte, MG", rating: 5, text: "Primeira vez viajando com a agência e não foi a última. Atendimento pelo WhatsApp rápido e claro.", pkg: null },
];

async function main() {
  await prisma.testimonial.deleteMany();
  await prisma.departure.deleteMany();
  await prisma.packageImage.deleteMany();
  await prisma.package.deleteMany();
  await prisma.category.deleteMany();
  await prisma.destination.deleteMany();

  const destinationMap = new Map<string, number>();
  for (const d of destinations) {
    const created = await prisma.destination.create({ data: d });
    destinationMap.set(created.slug, created.id);
  }

  const categoryMap = new Map<string, number>();
  for (const c of categories) {
    const created = await prisma.category.create({ data: c });
    categoryMap.set(created.slug, created.id);
  }

  const packageMap = new Map<string, number>();
  for (const p of packages) {
    const created = await prisma.package.create({
      data: {
        title: p.title,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        durationDays: p.durationDays,
        departureCity: p.departureCity,
        coverImage: p.coverImage,
        featured: p.featured,
        included: p.included,
        notIncluded: p.notIncluded,
        itinerary: p.itinerary,
        destinationId: destinationMap.get(p.destination)!,
        categoryId: categoryMap.get(p.category)!,
        images: {
          create: p.images.map((url, i) => ({ url, alt: `${p.title} - foto ${i + 1}`, order: i })),
        },
        departures: {
          create: p.departures.map((d) => ({
            departureDate: new Date(`${d.start}T06:00:00-03:00`),
            returnDate: new Date(`${d.end}T22:00:00-03:00`),
            spotsTotal: d.spots,
            spotsAvailable: Math.max(2, d.spots - Math.floor(Math.random() * d.spots * 0.7)),
          })),
        },
      },
    });
    packageMap.set(created.slug, created.id);
  }

  for (const t of testimonials) {
    await prisma.testimonial.create({
      data: {
        authorName: t.authorName,
        authorCity: t.authorCity,
        rating: t.rating,
        text: t.text,
        packageId: t.pkg ? packageMap.get(t.pkg) : null,
      },
    });
  }

  console.log(
    `Seed ok: ${destinations.length} destinos, ${categories.length} categorias, ${packages.length} pacotes, ${testimonials.length} depoimentos`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
