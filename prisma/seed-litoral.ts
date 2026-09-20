import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL!),
});

/**
 * Destinos do litoral paulista + Paraty e Fernando de Noronha.
 *
 * Idempotente: usa upsert por slug, então rodar de novo atualiza em vez de
 * duplicar. Precisa rodar também na VPS — o banco de produção é outro.
 *
 * As fotos vêm do Wikimedia Commons (host liberado em next.config.ts). São
 * provisórias: troque por fotos próprias no painel assim que tiver.
 */
const destinos = [
  {
    name: "Guarujá",
    slug: "guaruja",
    state: "SP",
    region: "Sudeste",
    featured: true,
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/ROGERIO_CASSIMIRO_morro_da_caixa_dagua_GUARUJA_SP_%2827787693658%29.jpg/1920px-ROGERIO_CASSIMIRO_morro_da_caixa_dagua_GUARUJA_SP_%2827787693658%29.jpg",
    description:
      "A praia mais conhecida do litoral paulista, a menos de duas horas de São Paulo. Enseada e Pitangueiras concentram quiosques, hotéis e movimento; Tortugas e Iporanga guardam o lado mais reservado da cidade. Bom para quem quer mar sem abrir mão de estrutura.",
  },
  {
    name: "Santos",
    slug: "santos",
    state: "SP",
    region: "Sudeste",
    featured: false,
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/5/53/Vista_de_Santos.jpg",
    description:
      "Sete quilômetros de orla emoldurados pelo maior jardim de praia do mundo, registrado no Guinness. Além do mar, a cidade tem centro histórico com bondinho turístico, o Museu do Café e o aquário municipal — programa que funciona mesmo em dia nublado.",
  },
  {
    name: "Bertioga",
    slug: "bertioga",
    state: "SP",
    region: "Sudeste",
    featured: false,
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/FORTE_S%C3%83O_FELIPE_e_FAROL_DA_PEDRA_DO_CORVO_-_VISTOS_DA_PRAIA_DA_ENSEADA_-_BERTIOGA-SP_-_panoramio.jpg/1920px-FORTE_S%C3%83O_FELIPE_e_FAROL_DA_PEDRA_DO_CORVO_-_VISTOS_DA_PRAIA_DA_ENSEADA_-_BERTIOGA-SP_-_panoramio.jpg",
    description:
      "Praias longas e de mar calmo, com o Forte São João — a fortificação mais antiga do Brasil ainda de pé — no centro. Menos concorrida que as vizinhas, é escolha comum de quem viaja com crianças e quer caminhar pela areia sem esbarrar em ninguém.",
  },
  {
    name: "Praia Grande",
    slug: "praia-grande",
    state: "SP",
    region: "Sudeste",
    featured: false,
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/GUILHERMINA_-_DEZ_2010_-_panoramio_%281%29.jpg/1920px-GUILHERMINA_-_DEZ_2010_-_panoramio_%281%29.jpg",
    description:
      "Vinte e dois quilômetros de areia contínua, do Canto do Forte ao Balneário Solemar. Orla toda calçada, ciclovia de ponta a ponta e quiosque a cada poucos metros: é o destino mais prático da Baixada para bate-volta em família.",
  },
  {
    name: "Riviera de São Lourenço",
    slug: "riviera-de-sao-lourenco",
    state: "SP",
    region: "Sudeste",
    featured: false,
    coverImage: "https://upload.wikimedia.org/wikipedia/commons/4/42/Vista_da_Riviera.jpg",
    description:
      "Bairro planejado em Bertioga, com fiação subterrânea, ruas arborizadas e praia monitorada. Tem centro comercial próprio e é um dos poucos trechos do litoral paulista com bandeira azul de balneabilidade recorrente. Perfil familiar e tranquilo.",
  },
  {
    name: "São Sebastião",
    slug: "sao-sebastiao",
    state: "SP",
    region: "Sudeste",
    featured: false,
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Praia_Camburi_-_S%C3%A3o_Sebasti%C3%A3o.jpg/1920px-Praia_Camburi_-_S%C3%A3o_Sebasti%C3%A3o.jpg",
    description:
      "Mais de cem praias espalhadas por cem quilômetros de costa, de Boiçucanga a Juquehy. Reúne o centro histórico colonial, a balsa para Ilhabela e alguns dos melhores picos de surfe do estado. Cada praia tem um perfil diferente — vale escolher com calma.",
  },
  {
    name: "Ilhabela",
    slug: "ilhabela",
    state: "SP",
    region: "Sudeste",
    featured: true,
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Sunset_View_-_Ilhabela.jpg/1920px-Sunset_View_-_Ilhabela.jpg",
    description:
      "Arquipélago coberto por Mata Atlântica preservada, com mais de trezentas cachoeiras e praias que só se alcançam de barco ou trilha. Capital brasileira da vela e ponto forte de mergulho, por conta dos naufrágios no canal. Chega-se de balsa a partir de São Sebastião.",
  },
  {
    name: "Maresias",
    slug: "maresias",
    state: "SP",
    region: "Sudeste",
    featured: false,
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Mareseis%2C_Sao_Paulo%2C_Brazil_-_panoramio.jpg/1920px-Mareseis%2C_Sao_Paulo%2C_Brazil_-_panoramio.jpg",
    description:
      "Point do surfe paulista e casa de etapas de campeonato mundial. Mar forte, público jovem e a vida noturna mais movimentada do litoral norte. Quem procura sossego costuma se hospedar nas praias vizinhas e vir só para o dia.",
  },
  {
    name: "Ubatuba",
    slug: "ubatuba",
    state: "SP",
    region: "Sudeste",
    featured: true,
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Ubatuba_Praia_da_Lagoinha_Por_do_Sol.JPG/1920px-Ubatuba_Praia_da_Lagoinha_Por_do_Sol.JPG",
    description:
      "Mais de cem praias entre costões e mata fechada, no extremo norte do litoral paulista. Abriga uma base do Projeto Tamar e trechos do Parque Estadual da Serra do Mar, com cachoeiras a poucos minutos da areia. Mar limpo e verde por todo lado.",
  },
  {
    name: "Paraty",
    slug: "paraty",
    state: "RJ",
    region: "Sudeste",
    featured: true,
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Centro_Hist%C3%B3rico_Paraty_7397.jpg/1920px-Centro_Hist%C3%B3rico_Paraty_7397.jpg",
    description:
      "Centro histórico do século XVIII com ruas de pedra fechadas para carros, reconhecido como Patrimônio Mundial pela Unesco. Em volta, uma baía com dezenas de ilhas percorrida de escuna, cachoeiras na Serra da Bocaina e alambiques de cachaça artesanal.",
  },
  {
    name: "Fernando de Noronha",
    slug: "fernando-de-noronha",
    state: "PE",
    region: "Nordeste",
    featured: true,
    coverImage:
      "https://upload.wikimedia.org/wikipedia/commons/9/91/EDUARDO_MURUCI_-_BAIA_DOS_PORCOS-%28recorte%29.jpg",
    description:
      "Arquipélago vulcânico a 350 km da costa, dentro de uma área de proteção ambiental com visitação controlada. Água transparente o ano inteiro, mergulho entre tartarugas e golfinhos, e a Baía do Sancho, eleita várias vezes a praia mais bonita do mundo.",
  },
];

async function main() {
  for (const destino of destinos) {
    const { slug, ...data } = destino;
    const result = await prisma.destination.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
      select: { id: true, name: true },
    });
    console.log(`  ${result.name} (id ${result.id})`);
  }

  const total = await prisma.destination.count();
  console.log(`\n${destinos.length} destinos processados. Total no banco: ${total}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
