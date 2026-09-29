"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function PanelExit({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("logout_failed");

      toast.success("Sessão terminada.");
      router.replace("/auth");
      router.refresh();
    } catch {
      toast.error("Não foi possível terminar a sessão.");
      setIsLoggingOut(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          title={compact ? "Sair" : undefined}
          aria-label="Sair"
          className={`group h-11 w-full px-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive ${compact ? "justify-center" : "justify-start gap-3"}`}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded bg-muted/80 transition-colors group-hover:bg-destructive/10">
            <LogOut className="size-4" />
          </span>
          {!compact && <span>Sair</span>}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md rounded p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-3xl font-normal">
            Sair do painel?
          </AlertDialogTitle>
          <AlertDialogDescription>
            A sessão atual será terminada e voltará à página de acesso.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction disabled={isLoggingOut} onClick={() => void logout()}>
            {isLoggingOut ? "A sair..." : "Sair"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
