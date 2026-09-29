import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

import { destroyImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import {
  apiError,
  hasErrorCode,
  nullableText,
  requireApiUser,
  slugify,
  validateMutationOrigin,
} from "@/server/api";
import { getCurrentUser } from "@/server/auth";
import { publicProductSelect } from "@/server/repositories/products";
import { productUpdateSchema } from "@/server/schemas";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ identifier: string }> };

function productLocator(identifier: string): Prisma.ProductWhereInput {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    identifier,
  )
    ? { id: identifier }
    : { slug: identifier };
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { identifier } = await params;
    const user = await getCurrentUser();
    const canSeeAll = user?.role === "ADMIN";
    const product = await prisma.product.findFirst({
      where: { ...productLocator(identifier), ...(canSeeAll ? {} : { status: "ACTIVE" }) },
      select: canSeeAll ? { ...publicProductSelect, status: true } : publicProductSelect,
    });

    return product ? Response.json({ product }) : apiError("Produto não encontrado.", 404);
  } catch (error) {
    console.error("Falha ao consultar produto", error);
    return apiError("Não foi possível consultar o produto.", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const auth = await requireApiUser("ADMIN");
  if (!auth.ok) return auth.response;

  try {
    const { identifier } = await params;
    const existing = await prisma.product.findFirst({
      where: productLocator(identifier),
      select: { id: true, slug: true, imagePublicId: true },
    });
    if (!existing) return apiError("Produto não encontrado.", 404);

    const payload = productUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!payload.success) {
      return apiError("Dados do produto inválidos.", 400, payload.error.flatten());
    }

    const input = payload.data;
    const data: Prisma.ProductUpdateInput = {};
    if (input.slug !== undefined) data.slug = slugify(input.slug);
    if (input.namePt !== undefined) data.namePt = input.namePt;
    if (input.nameEn !== undefined) data.nameEn = input.nameEn;
    if (input.descriptionPt !== undefined) data.descriptionPt = input.descriptionPt;
    if (input.descriptionEn !== undefined) data.descriptionEn = input.descriptionEn;
    if (input.detailPt !== undefined) data.detailPt = nullableText(input.detailPt) ?? null;
    if (input.detailEn !== undefined) data.detailEn = nullableText(input.detailEn) ?? null;
    if (input.categorySlug !== undefined) {
      data.category = { connect: { slug: input.categorySlug } };
    }
    if (input.status !== undefined) data.status = input.status;
    if (input.price !== undefined) data.price = input.price.toFixed(2);
    if (input.currency !== undefined) data.currency = input.currency;
    if (input.originPt !== undefined) data.originPt = input.originPt;
    if (input.originEn !== undefined) data.originEn = input.originEn;
    if (input.leadTimePt !== undefined) data.leadTimePt = input.leadTimePt;
    if (input.leadTimeEn !== undefined) data.leadTimeEn = input.leadTimeEn;
    if (input.minQuantity !== undefined) data.minQuantity = input.minQuantity;
    if (input.unitPt !== undefined) data.unitPt = input.unitPt;
    if (input.unitEn !== undefined) data.unitEn = input.unitEn;
    if (input.imageUrl !== undefined) data.imageUrl = nullableText(input.imageUrl) ?? null;
    if (input.imagePublicId !== undefined)
      data.imagePublicId = nullableText(input.imagePublicId) ?? null;
    if (input.featured !== undefined) data.featuredOrder = input.featured ? 1 : 0;

    if (data.slug === "") return apiError("O slug não pode ficar vazio.", 400);

    const product = await prisma.product.update({
      where: { id: existing.id },
      data,
      select: { ...publicProductSelect, status: true },
    });

    if (
      existing.imagePublicId &&
      input.imagePublicId !== undefined &&
      input.imagePublicId !== existing.imagePublicId
    ) {
      await destroyImage(existing.imagePublicId).catch((error) =>
        console.error("Falha ao remover imagem anterior do produto", error),
      );
    }
    revalidatePath("/");
    revalidatePath("/catalog");
    revalidatePath(`/product/${existing.id}`);
    return Response.json({ product });
  } catch (error) {
    if (hasErrorCode(error, "P2002")) {
      return apiError("Já existe um produto com este slug.", 409);
    }
    if (hasErrorCode(error, "P2025") || hasErrorCode(error, "P2003")) {
      return apiError("A categoria selecionada já não existe.", 400);
    }
    console.error("Falha ao atualizar produto", error);
    return apiError("Não foi possível atualizar o produto.", 500);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const originError = validateMutationOrigin(request);
  if (originError) return originError;

  const auth = await requireApiUser("ADMIN");
  if (!auth.ok) return auth.response;

  try {
    const { identifier } = await params;
    const existing = await prisma.product.findFirst({
      where: productLocator(identifier),
      select: { id: true, slug: true, imagePublicId: true },
    });
    if (!existing) return apiError("Produto não encontrado.", 404);

    await prisma.product.delete({ where: { id: existing.id } });
    if (existing.imagePublicId) {
      await destroyImage(existing.imagePublicId).catch((error) =>
        console.error("Falha ao remover imagem do produto excluído", error),
      );
    }
    revalidatePath("/");
    revalidatePath("/catalog");
    revalidatePath(`/product/${existing.id}`);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Falha ao arquivar produto", error);
    return apiError("Não foi possível arquivar o produto.", 500);
  }
}
