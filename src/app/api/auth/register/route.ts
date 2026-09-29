import { hashPassword, createUserSession, isSameOrigin } from "@/server/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z
    .string()
    .trim()
    .email()
    .max(255)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Origem da requisição inválida." }, { status: 403 });
  }

  try {
    const payload = registerSchema.safeParse(await request.json().catch(() => null));
    if (!payload.success) {
      return Response.json(
        { error: "Preencha nome, e-mail e uma palavra-passe com pelo menos 8 caracteres." },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: payload.data.email },
      select: { id: true },
    });
    if (existingUser) {
      return Response.json({ error: "Já existe uma conta com este e-mail." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name: payload.data.name,
        email: payload.data.email,
        passwordHash: await hashPassword(payload.data.password),
      },
      select: { id: true, name: true, email: true, role: true },
    });

    await createUserSession(user.id);
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Falha ao criar conta", error);
    return Response.json({ error: "Não foi possível criar a conta." }, { status: 500 });
  }
}
