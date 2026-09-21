import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BusFront, Headset, ShieldCheck, Star, Wallet } from "lucide-react";
import { DestinationSearch } from "@/components/destination-search";
import { DestinationCard } from "@/components/destination-card";
import { PackageCard } from "@/components/package-card";
import {
  getAllDestinations,
  getFeaturedDestinations,
  getFeaturedPackages,
  getTestimonials,
} from "@/lib/queries";

/**
 * A home é pré-renderizada no build. Sem isto, a lista de "próximas saídas"
 * ficaria congelada no instante do deploy e acabaria anunciando data que já
 * passou. As mutações do painel também chamam revalidatePath("/"), mas este
 * prazo cobre o que muda sozinho com o tempo.
 */
export const revalidate = 300;

const benefits = [
  {
    icon: BusFront,
    title: "Saídas em grupo",
    text: "Transporte confortável com guia acompanhante do início ao fim.",
  },
  {
    icon: Wallet,
    title: "Preço final",
    text: "Sem taxas escondidas. O valor que você vê é o que você paga.",
  },
  {
    icon: Headset,
    title: "Atendimento humano",
    text: "Tire dúvidas e reserve direto pelo WhatsApp com a nossa equipe.",
  },
  {
    icon: ShieldCheck,
    title: "Agência registrada",
    text: "Cadastur ativo e mais de 10 anos levando viajantes pelo Brasil.",
  },
];

const steps = [
  {
    n: "01",
    title: "Escolha o destino",
    text: "Busque pelo lugar que você quer conhecer e veja todos os pacotes disponíveis.",
  },
  {
    n: "02",
    title: "Compare os pacotes",
    text: "Datas, duração, o que está incluso e preço por pessoa, tudo na mesma tela.",
  },
  {
    n: "03",
    title: "Reserve pelo WhatsApp",
    text: "Clique em reservar e fale com a gente. Confirmamos sua vaga na hora.",
  },
];

export default async function Home() {
  const [allDestinations, featuredDestinations, featuredPackages, testimonials] = await Promise.all([
    getAllDestinations(),
    getFeaturedDestinations(),
    getFeaturedPackages(6),
    getTestimonials(6),
  ]);

  const searchable = allDestinations.map((d) => ({
    name: d.name,
    slug: d.slug,
    state: d.state,
    region: d.region,
    packageCount: d._count.packages,
  }));

  // A home mostra uma seleção; a lista completa fica em /destinos.
  const showcase = featuredDestinations.slice(0, 8);

  return (
    <>
      <section className="relative flex min-h-[600px] items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 to-transparent" />

        {/* w-full é obrigatório: como a section é flex, sem isso a div
            encolhe ao conteúdo e o margin auto a centraliza fora da grade. */}
        <div className="container-page relative z-10 w-full py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Excursões e pacotes pelo Brasil
            </p>
            <h1 className="mt-5 font-display text-[2.75rem] font-semibold leading-[1.05] text-white sm:text-6xl">
              Viajar em grupo, <br className="hidden sm:block" />
              sem dor de cabeça.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/80">
              Transporte, hospedagem e guia inclusos. Você escolhe o destino, a gente cuida do
              resto.
            </p>

            <div className="mt-9">
              <DestinationSearch destinations={searchable} />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-white/50">Mais procurados:</span>
              {/* Três cabem numa linha dentro do bloco de texto do hero;
                  o quarto quebrava e desalinhava o conjunto. */}
              {featuredDestinations.slice(0, 3).map((d) => (
                <Link
                  key={d.slug}
                  href={`/destinos/${d.slug}`}
                  className="rounded-full border border-white/20 px-3.5 py-1.5 text-white/80 transition hover:border-white/50 hover:text-white"
                >
                  {d.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface">
        <div className="container-page grid gap-x-8 gap-y-9 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title}>
              <b.icon className="size-6 text-brand" strokeWidth={1.5} />
              <h3 className="mt-4 text-base font-semibold">{b.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-20 sm:py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Onde ir</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Destinos populares</h2>
          </div>
          <Link
            href="/destinos"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand"
          >
            Ver todos os {allDestinations.length} destinos
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {showcase.map((d) => (
            <DestinationCard
              key={d.slug}
              name={d.name}
              slug={d.slug}
              state={d.state}
              coverImage={d.coverImage}
              packageCount={d._count.packages}
            />
          ))}
        </div>
      </section>

      <section id="pacotes" className="scroll-mt-24 bg-surface py-20 sm:py-24">
        <div className="container-page">
          <div className="mb-10 max-w-xl">
            <p className="eyebrow">Próximas saídas</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Pacotes em destaque</h2>
            <p className="mt-3 leading-relaxed text-muted">
              Selecionados pela nossa equipe entre as viagens com data confirmada.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPackages.map((p) => (
              <PackageCard key={p.id} pkg={p} />
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-24 bg-brand-dark py-20 text-white sm:py-24">
        <div className="container-page">
          <div className="mb-12 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">
              Simples assim
            </p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Como funciona</h2>
          </div>

          <ol className="grid gap-10 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="border-t border-white/20 pt-6">
                <span className="font-display text-3xl font-semibold text-white/35">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="depoimentos" className="container-page scroll-mt-24 py-20 sm:py-24">
        <div className="mb-10 max-w-xl">
          <p className="eyebrow">Depoimentos</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Quem já viajou com a gente</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.id}
              className="flex flex-col rounded-2xl border border-border bg-surface p-6"
            >
              <div className="flex gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-3.5 ${i < t.rating ? "fill-current" : "text-border"}`}
                  />
                ))}
              </div>

              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/85">
                “{t.text}”
              </blockquote>

              <figcaption className="mt-5 border-t border-border pt-4 text-xs text-muted">
                <span className="font-semibold text-foreground">{t.authorName}</span> · {t.authorCity}
                {t.package && (
                  <>
                    <br />
                    <Link
                      href={`/pacotes/${t.package.slug}`}
                      className="text-brand transition hover:text-brand-dark"
                    >
                      {t.package.title}
                    </Link>
                  </>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
