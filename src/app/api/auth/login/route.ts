import { createUserSession, isSameOrigin, verifyPassword } from "@/server/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(255)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Origem da requisição inválida." }, { status: 403 });
  }

  try {
    const payload = loginSchema.safeParse(await request.json().catch(() => null));
    if (!payload.success) {
      return Response.json({ error: "E-mail ou palavra-passe inválidos." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: payload.data.email },
      select: { id: true, name: true, email: true, role: true, passwordHash: true },
    });

    if (!user?.passwordHash || !(await verifyPassword(payload.data.password, user.passwordHash))) {
      return Response.json({ error: "E-mail ou palavra-passe inválidos." }, { status: 401 });
    }

    await createUserSession(user.id);
    const { passwordHash: _, ...safeUser } = user;
    return Response.json({ user: safeUser });
  } catch (error) {
    console.error("Falha ao iniciar sessão", error);
    return Response.json({ error: "Não foi possível iniciar a sessão." }, { status: 500 });
  }
}
