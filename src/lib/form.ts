export type FormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[] | undefined>;
    }
  | undefined;

/** Hosts liberados em `next.config.ts` → `images.remotePatterns`.
 *  Mantenha os dois lados em sincronia: uma URL fora desta lista passa na
 *  validação do formulário mas o `next/image` recusa em tempo de execução. */
export const ALLOWED_IMAGE_HOSTS = ["images.unsplash.com"];

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // tira acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isAllowedImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_IMAGE_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

/** Data do banco → valor de um <input type="date">.
 *  As datas de saída são gravadas ao meio-dia UTC justamente para que este
 *  recorte devolva o mesmo dia que o site exibe em horário de Brasília. */
export function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Erro de chave única do MySQL/MariaDB via Prisma. */
export function isUniqueViolation(err: unknown) {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}
