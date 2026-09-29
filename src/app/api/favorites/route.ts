import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { apiError, requireApiUser, validateMutationOrigin } from "@/server/api";
import { publicProductSelect } from "@/server/repositories/products";

export const runtime = "nodejs";

const favoriteSchema = z.object({ productId: z.string().uuid() });

export async function GET() {
  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: auth.user.id, product: { status: "ACTIVE" } },
      select: { createdAt: true, product: { select: publicProductSelect } },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({
      items: favorites.map(({ product, createdAt }) => ({ ...product, favoritedAt: createdAt })),
    });
  } catch (error) {
    console.error("Falha ao listar favoritos", error);
    return apiError("Não foi possível listar os favoritos.", 500);
  }
}

export async function POST(request: Request) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  try {
    const payload = favoriteSchema.safeParse(await request.json().catch(() => null));
    if (!payload.success) return apiError("Produto inválido.", 400, payload.error.flatten());

    const product = await prisma.product.findFirst({
      where: { id: payload.data.productId, status: "ACTIVE" },
      select: { id: true },
    });
    if (!product) return apiError("Produto não encontrado.", 404);

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_productId: { userId: auth.user.id, productId: payload.data.productId },
      },
      create: { userId: auth.user.id, productId: payload.data.productId },
      update: {},
      select: { productId: true, createdAt: true },
    });

    return Response.json({ favorite }, { status: 201 });
  } catch (error) {
    console.error("Falha ao adicionar favorito", error);
    return apiError("Não foi possível adicionar o favorito.", 500);
  }
}
