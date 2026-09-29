import type { Metadata } from "next";

import { SourcingRequestManager } from "@/components/admin/sourcing-request-manager";

export const metadata: Metadata = { title: "Pedidos de pesquisa" };

export default function Page() {
  return <SourcingRequestManager />;
}
