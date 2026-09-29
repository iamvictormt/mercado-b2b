import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PanelExit } from "@/components/panel-exit";
import { Button } from "@/components/ui/button";

export function PanelActions({
  compact = false,
  onNavigate,
}: {
  compact?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div
      className="mt-auto border-t border-border bg-background/50 p-2"
      aria-label="Ações da conta"
    >
      <div className="flex flex-col gap-1">
        <Button
          asChild
          variant="ghost"
          title={compact ? "Voltar à plataforma" : undefined}
          className={`group h-11 w-full px-2 text-muted-foreground hover:bg-store-blue/10 hover:text-foreground ${compact ? "justify-center" : "justify-start gap-3"}`}
        >
          <Link
            href="/"
            {...(onNavigate ? { onClick: onNavigate } : {})}
            {...(compact ? { "aria-label": "Voltar à plataforma" } : {})}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded bg-muted/80 transition-colors group-hover:bg-store-blue/10">
              <ArrowLeft className="size-4" />
            </span>
            {!compact && <span>Voltar à plataforma</span>}
          </Link>
        </Button>
        <PanelExit compact={compact} />
      </div>
    </div>
  );
}
