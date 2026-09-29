import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/lib/products";

export const publicProductSelect = {
  id: true,
  slug: true,
  namePt: true,
  nameEn: true,
  descriptionPt: true,
  descriptionEn: true,
  detailPt: true,
  detailEn: true,
  category: {
    select: {
      slug: true,
      namePt: true,
      nameEn: true,
    },
  },
  price: true,
  currency: true,
  originPt: true,
  originEn: true,
  leadTimePt: true,
  leadTimeEn: true,
  minQuantity: true,
  unitPt: true,
  unitEn: true,
  imageUrl: true,
  imagePublicId: true,
  featuredOrder: true,
  createdAt: true,
  updatedAt: true,
} as const;

type PublicProduct = Prisma.ProductGetPayload<{ select: typeof publicProductSelect }>;

export function toStoreProduct(product: PublicProduct): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: { pt: product.namePt, en: product.nameEn },
    category: product.category.slug,
    categoryName: { pt: product.category.namePt, en: product.category.nameEn },
    image: {
      src: product.imageUrl ?? "/product-placeholder.svg",
      width: 1200,
      height: 1200,
    },
    price: Number(product.price),
    currency: product.currency,
    detail: { pt: product.detailPt ?? "", en: product.detailEn ?? "" },
    description: { pt: product.descriptionPt, en: product.descriptionEn },
    origin: { pt: product.originPt, en: product.originEn },
    leadTime: { pt: product.leadTimePt, en: product.leadTimeEn },
    minQty: product.minQuantity,
    unit: { pt: product.unitPt, en: product.unitEn },
    featured: product.featuredOrder > 0,
  };
}

export function listActiveProducts() {
  return prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: publicProductSelect,
    orderBy: [{ featuredOrder: "desc" }, { createdAt: "desc" }],
  });
}

export function getActiveProductById(id: string) {
  return prisma.product.findFirst({
    where: { id, status: "ACTIVE" },
    select: publicProductSelect,
  });
}
