export type FormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[] | undefined>;
    }
  | undefined;

/** Hosts liberados em `next.config.ts` → `images.remotePatterns`.
 *
 *  As imagens novas entram por upload (`/api/uploads/...`, caminho local que
 *  dispensa remotePatterns). Esta lista existe para as fotos que já estavam
 *  no banco antes do upload existir — o seed usa as duas origens. */
export const ALLOWED_IMAGE_HOSTS = ["images.unsplash.com", "upload.wikimedia.org"];

/**
 * Acha um slug livre, acrescentando sufixo numérico se preciso.
 *
 * Sem isso, cadastrar dois destinos com o mesmo nome falharia em erro de
 * chave única — e como o slug agora é gerado sozinho a partir do nome, a
 * pessoa não teria nem como corrigir pelo formulário.
 */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<{ id: number } | null>,
  ignoreId?: number,
) {
  const raiz = base || "item";

  for (let n = 1; n < 200; n++) {
    const candidate = n === 1 ? raiz : `${raiz}-${n}`;
    const found = await exists(candidate);
    if (!found || found.id === ignoreId) return candidate;
  }

  // Fim de linha improvável; o sufixo aleatório garante que não trava.
  return `${raiz}-${Date.now().toString(36)}`;
}

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
