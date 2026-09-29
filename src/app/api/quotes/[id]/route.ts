import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { apiError, nullableText, requireApiUser, validateMutationOrigin } from "@/server/api";
import { quoteUpdateSchema } from "@/server/schemas";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const include = {
  company: { select: { id: true, name: true, email: true, phone: true } },
  requestedBy: { select: { id: true, name: true, email: true } },
  items: {
    include: {
      product: { select: { id: true, slug: true, namePt: true, nameEn: true, imageUrl: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const quote = await prisma.quote.findFirst({
      where: {
        id,
        ...(auth.user.role === "ADMIN" ? {} : { requestedById: auth.user.id }),
      },
      include,
    });
    return quote ? Response.json({ quote }) : apiError("Cotação não encontrada.", 404);
  } catch (error) {
    console.error("Falha ao consultar cotação", error);
    return apiError("Não foi possível consultar a cotação.", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const auth = await requireApiUser("ADMIN");
  if (!auth.ok) return auth.response;

  try {
    const payload = quoteUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!payload.success) {
      return apiError("Dados da cotação inválidos.", 400, payload.error.flatten());
    }
    const { id } = await params;
    const input = payload.data;
    const data: Prisma.QuoteUpdateInput = {};
    if (input.status !== undefined) {
      data.status = input.status;
      if (input.status === "QUOTED") data.quotedAt = new Date();
      if (input.status === "DELIVERED") data.deliveredAt = new Date();
    }
    if (input.notes !== undefined) data.notes = nullableText(input.notes) ?? null;
    if (input.validUntil !== undefined) {
      data.validUntil = input.validUntil ? new Date(`${input.validUntil}T00:00:00.000Z`) : null;
    }

    const existing = await prisma.quote.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return apiError("Cotação não encontrada.", 404);
    const quote = await prisma.quote.update({ where: { id }, data, include });
    return Response.json({ quote });
  } catch (error) {
    console.error("Falha ao atualizar cotação", error);
    return apiError("Não foi possível atualizar a cotação.", 500);
  }
}
