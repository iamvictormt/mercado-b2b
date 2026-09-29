import { prisma } from "@/lib/prisma";
import { apiError, requireApiUser, validateMutationOrigin } from "@/server/api";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ productId: string }> };

export async function DELETE(request: Request, { params }: RouteContext) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const auth = await requireApiUser();
  if (!auth.ok) return auth.response;

  try {
    const { productId } = await params;
    await prisma.favorite.deleteMany({ where: { userId: auth.user.id, productId } });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Falha ao remover favorito", error);
    return apiError("Não foi possível remover o favorito.", 500);
  }
}
