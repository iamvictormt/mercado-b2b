import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductPage from "@/routes/product.$slug";
import { getStorefrontViewer } from "@/server/auth";
import { getActiveProductById, toStoreProduct } from "@/server/repositories/products";

export const dynamic = "force-dynamic";

type ProductRouteProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductRouteProps): Promise<Metadata> {
  const { id } = await params;
  const record = await getActiveProductById(id);
  const product = record ? toStoreProduct(record) : null;

  if (!product) {
    return {
      title: "Produto indisponível",
      description: "Produto indisponível.",
      robots: { index: false },
    };
  }

  return {
    title: product.name.pt,
    description: product.description.pt,
    openGraph: {
      title: `${product.name.pt} — Mercado B2B`,
      description: product.description.pt,
      images: [
        { url: product.image.src, width: product.image.width, height: product.image.height },
      ],
    },
  };
}

export default async function Page({ params }: ProductRouteProps) {
  const { id } = await params;
  const [record, viewer] = await Promise.all([getActiveProductById(id), getStorefrontViewer()]);
  if (!record) notFound();

  return <ProductPage product={toStoreProduct(record)} viewer={viewer} />;
}
