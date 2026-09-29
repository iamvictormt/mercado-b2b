import type { Metadata } from "next";

import { CustomerFavoriteList } from "@/components/account/favorite-list";

export const metadata: Metadata = { title: "Favoritos" };

export default function Page() {
  return <CustomerFavoriteList />;
}
