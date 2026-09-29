import type { Metadata } from "next";

import { AdminQuoteManager } from "@/components/admin/quote-manager";

export const metadata: Metadata = { title: "Cotações" };

export default function Page() {
  return <AdminQuoteManager />;
}
