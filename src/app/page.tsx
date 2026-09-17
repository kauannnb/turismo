import Image from "next/image";
import Link from "next/link";
import { BusFront, Headset, ShieldCheck, Star, Wallet } from "lucide-react";
import { DestinationSearch } from "@/components/destination-search";
import { DestinationCard } from "@/components/destination-card";
import { PackageCard } from "@/components/package-card";
import {
  getAllDestinations,
  getFeaturedDestinations,
  getFeaturedPackages,
  getTestimonials,
} from "@/lib/queries";

const benefits = [
  { icon: BusFront, title: "Saídas em grupo", text: "Transporte confortável com guia acompanhante do início ao fim." },
  { icon: Wallet, title: "Preço final", text: "Sem taxas escondidas. O valor que você vê é o que você paga." },
  { icon: Headset, title: "Atendimento humano", text: "Tire dúvidas e reserve direto pelo WhatsApp com a nossa equipe." },
  { icon: ShieldCheck, title: "Agência registrada", text: "Cadastur ativo e mais de 10 anos levando viajantes pelo Brasil." },
];

const steps = [
  { n: "1", title: "Escolha o destino", text: "Busque pelo lugar que você quer conhecer e veja todos os pacotes disponíveis." },
  { n: "2", title: "Compare os pacotes", text: "Datas, duração, o que está incluso e preço por pessoa, tudo na mesma tela." },
  { n: "3", title: "Reserve pelo WhatsApp", text: "Clique em reservar e fale com a gente. Confirmamos sua vaga na hora." },
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

  return (
    <>
      <section className="relative flex min-h-[520px] items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center text-white">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Sua próxima viagem <span className="text-accent">começa aqui</span>
          </h1>
          <p className="max-w-xl text-lg text-white/90">
            Excursões e pacotes com saídas em grupo para os melhores destinos do Brasil.
          </p>
          <DestinationSearch destinations={searchable} />
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-white/80">
            <span>Populares:</span>
            {featuredDestinations.slice(0, 5).map((d) => (
              <Link
                key={d.slug}
                href={`/destinos/${d.slug}`}
                className="rounded-full bg-white/15 px-3 py-1 backdrop-blur transition hover:bg-white/30"
              >
                {d.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Destinos populares</h2>
            <p className="text-muted">Os lugares mais procurados pelos nossos viajantes</p>
          </div>
          <Link href="/destinos" className="text-sm font-semibold text-brand hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredDestinations.map((d) => (
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

      <section className="bg-surface py-12">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="flex gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                <b.icon className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">{b.title}</h3>
                <p className="text-sm text-muted">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="pacotes" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Pacotes em destaque</h2>
          <p className="text-muted">Selecionados pela nossa equipe para as próximas saídas</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPackages.map((p) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-20 bg-brand-dark py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">Como funciona</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent text-xl font-bold">
                  {s.n}
                </span>
                <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
                <p className="text-sm text-white/80">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="depoimentos" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">O que dizem nossos viajantes</h2>
          <p className="text-muted">Avaliações reais de quem já viajou com a gente</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.id} className="flex flex-col gap-3 rounded-2xl bg-surface p-5 ring-1 ring-border">
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`size-4 ${i < t.rating ? "fill-current" : "text-border"}`} />
                ))}
              </div>
              <blockquote className="text-sm text-foreground/90">“{t.text}”</blockquote>
              <figcaption className="mt-auto text-xs text-muted">
                <span className="font-semibold text-foreground">{t.authorName}</span> · {t.authorCity}
                {t.package && (
                  <>
                    {" · "}
                    <Link href={`/pacotes/${t.package.slug}`} className="text-brand hover:underline">
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
