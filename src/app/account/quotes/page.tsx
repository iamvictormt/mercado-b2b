import type { Metadata } from "next";

import { CustomerQuoteList } from "@/components/account/quote-list";

export const metadata: Metadata = { title: "Minhas cotações" };

export default function Page() {
  return <CustomerQuoteList />;
}
