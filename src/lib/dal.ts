import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

/**
 * Camada de acesso a dados do admin.
 *
 * O `proxy.ts` faz só a checagem otimista (existe cookie válido?) para
 * redirecionar cedo. A verificação que vale é esta: confere no banco se o
 * usuário da sessão ainda existe. Sem isso, um usuário removido continuaria
 * entrando até o token expirar.
 *
 * `cache()` memoiza dentro de um mesmo render, então chamar `requireAdmin()`
 * no layout e em cada página não multiplica consultas.
 */
export const getAdminUser = cache(async () => {
  const session = await readSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true },
  });
});

export const requireAdmin = cache(async () => {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
});
