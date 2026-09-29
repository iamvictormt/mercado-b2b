import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { PanelShell } from "@/components/panel-shell";
import { getCurrentUser } from "@/server/auth";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/account/quotes");
  if (user.role !== "CUSTOMER") redirect("/admin/summary");

  return (
    <PanelShell
      variant="account"
      contextLabel={user.company?.name ?? user.name}
      sessionExpiresAt={user.sessionExpiresAt}
    >
      {children}
    </PanelShell>
  );
}
