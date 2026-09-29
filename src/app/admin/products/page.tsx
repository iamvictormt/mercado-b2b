import type { Metadata } from "next";

import { ProductManager } from "@/components/admin/product-manager";

export const metadata: Metadata = { title: "Produtos" };

export default function Page() {
  return <ProductManager />;
}
