"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";

const LoginSchema = z.object({
  email: z.email({ error: "Informe um e-mail válido." }),
  password: z.string().min(1, { error: "Informe a senha." }),
});

export type LoginState = { error: string } | undefined;

/** Só aceita caminhos internos do admin — impede virar redirect aberto. */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { error: "Preencha e-mail e senha." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Mensagem idêntica para e-mail inexistente e senha errada: contar qual dos
  // dois falhou entrega a um atacante quais e-mails existem.
  const invalid = { error: "E-mail ou senha incorretos." };

  if (!user) {
    // Gasta o mesmo tempo de um bcrypt real, senão dá para descobrir se o
    // e-mail existe só cronometrando a resposta.
    await bcrypt.hash(parsed.data.password, 10);
    return invalid;
  }

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return invalid;

  await createSession({ userId: user.id, name: user.name });

  // redirect() lança uma exceção de controle do Next — tem que ficar fora de
  // qualquer try/catch, senão é engolida e o login trava sem sair do lugar.
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
