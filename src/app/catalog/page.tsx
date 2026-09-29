import type { Metadata } from "next";

import CatalogPage from "@/routes/catalog";
import { listActiveProducts, toStoreProduct } from "@/server/repositories/products";

export const dynamic = "force-dynamic";

const description =
  "Explore equipamentos e abastecimento para empresas em São Tomé, com preços indicativos e cotações.";

export const metadata: Metadata = {
  title: "Catálogo de equipamentos",
  description,
  openGraph: {
    title: "Catálogo de equipamentos — Mercado B2B",
    description:
      "Equipamentos para escritórios, gráficas, agro-negócios e pequenos negócios em São Tomé.",
  },
};

export default async function Page() {
  const products = (await listActiveProducts()).map(toStoreProduct);
  return <CatalogPage products={products} />;
}
