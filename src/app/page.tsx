import type { Metadata } from "next";

import Storefront from "@/routes/index";
import { getStorefrontViewer } from "@/server/auth";
import { listActiveProducts, toStoreProduct } from "@/server/repositories/products";

export const dynamic = "force-dynamic";

const description =
  "Abastecimento e equipamentos para pequenos negócios em São Tomé, direto de fornecedores internacionais.";

export const metadata: Metadata = {
  title: { absolute: "Mercado B2B — Plataforma de compras empresariais em São Tomé" },
  description,
  openGraph: {
    title: "Mercado B2B — Compras empresariais em São Tomé",
    description,
  },
};

export default async function HomePage() {
  const [records, viewer] = await Promise.all([listActiveProducts(), getStorefrontViewer()]);
  return <Storefront products={records.map(toStoreProduct)} viewer={viewer} />;
}
