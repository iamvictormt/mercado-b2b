import type { Metadata } from "next";

import { CustomerSourcingRequestList } from "@/components/account/sourcing-request-list";

export const metadata: Metadata = { title: "Pedidos de pesquisa" };

export default function Page() {
  return <CustomerSourcingRequestList />;
}
