import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { Product, ProductCategory } from "@/lib/products";

export const publicProductSelect = {
  id: true,
  slug: true,
  namePt: true,
  nameEn: true,
  descriptionPt: true,
  descriptionEn: true,
  detailPt: true,
  detailEn: true,
  category: true,
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

const categoryNames: Record<ProductCategory, Product["categoryName"]> = {
  office: { pt: "Escritórios", en: "Offices" },
  print: { pt: "Gráficas e comunicação", en: "Print & communication" },
  agro: { pt: "Agro-negócios", en: "Agribusiness" },
  business: { pt: "Pequenos negócios", en: "Small businesses" },
  other: { pt: "Outros", en: "Other" },
};

export function toStoreProduct(product: PublicProduct): Product {
  const category = product.category.toLowerCase() as ProductCategory;

  return {
    id: product.id,
    slug: product.slug,
    name: { pt: product.namePt, en: product.nameEn },
    category,
    categoryName: categoryNames[category],
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
    featured: product.featuredOrder,
  };
}

export function listActiveProducts() {
  return prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: publicProductSelect,
    orderBy: [{ featuredOrder: "desc" }, { createdAt: "desc" }],
  });
}

export function getActiveProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    select: publicProductSelect,
  });
}
