import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { apiError, hasErrorCode, requireApiUser, validateMutationOrigin } from "@/server/api";
import { productCategoryUpdateSchema } from "@/server/schemas";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

const categorySelect = {
  slug: true,
  namePt: true,
  nameEn: true,
  _count: { select: { products: true } },
} as const;

export async function PATCH(request: Request, { params }: RouteContext) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const auth = await requireApiUser("ADMIN");
  if (!auth.ok) return auth.response;

  try {
    const { slug } = await params;
    const payload = productCategoryUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!payload.success) {
      return apiError("Dados da categoria inválidos.", 400, payload.error.flatten());
    }

    const data: { namePt?: string; nameEn?: string } = {};
    if (payload.data.namePt !== undefined) data.namePt = payload.data.namePt;
    if (payload.data.nameEn !== undefined) data.nameEn = payload.data.nameEn;

    const category = await prisma.productCategory.update({
      where: { slug },
      data,
      select: categorySelect,
    });

    revalidatePath("/");
    revalidatePath("/catalog");
    return Response.json({ category });
  } catch (error) {
    if (hasErrorCode(error, "P2025")) return apiError("Categoria não encontrada.", 404);
    console.error("Falha ao atualizar categoria de produto", error);
    return apiError("Não foi possível atualizar a categoria.", 500);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const auth = await requireApiUser("ADMIN");
  if (!auth.ok) return auth.response;

  try {
    const { slug } = await params;
    const category = await prisma.productCategory.findUnique({
      where: { slug },
      select: { _count: { select: { products: true } } },
    });
    if (!category) return apiError("Categoria não encontrada.", 404);
    if (category._count.products > 0) {
      return apiError(
        `Esta categoria ainda possui ${category._count.products} produto(s). Mova-os antes de excluir.`,
        409,
      );
    }

    await prisma.productCategory.delete({ where: { slug } });
    revalidatePath("/");
    revalidatePath("/catalog");
    return new Response(null, { status: 204 });
  } catch (error) {
    if (hasErrorCode(error, "P2025")) return apiError("Categoria não encontrada.", 404);
    if (hasErrorCode(error, "P2003")) {
      return apiError("Esta categoria ainda está vinculada a produtos.", 409);
    }
    console.error("Falha ao excluir categoria de produto", error);
    return apiError("Não foi possível excluir a categoria.", 500);
  }
}
