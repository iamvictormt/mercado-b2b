"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { StoreLocale } from "@/lib/products";
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

export function PanelExit({ compact = false, locale }: { compact?: boolean; locale: StoreLocale }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const copy =
    locale === "pt"
      ? {
          exit: "Sair",
          success: "Sessão terminada.",
          error: "Não foi possível terminar a sessão.",
          title: "Sair do painel?",
          description: "A sessão atual será terminada e voltará à página de acesso.",
          cancel: "Cancelar",
          leaving: "A sair...",
        }
      : {
          exit: "Sign out",
          success: "Session ended.",
          error: "The session could not be ended.",
          title: "Sign out of the panel?",
          description: "The current session will end and you will return to the sign-in page.",
          cancel: "Cancel",
          leaving: "Signing out...",
        };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("logout_failed");

      toast.success(copy.success);
      router.replace("/auth");
      router.refresh();
    } catch {
      toast.error(copy.error);
      setIsLoggingOut(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          title={compact ? copy.exit : undefined}
          aria-label={copy.exit}
          className={`group h-11 w-full px-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive ${compact ? "justify-center" : "justify-start gap-3"}`}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded bg-muted/80 transition-colors group-hover:bg-destructive/10">
            <LogOut className="size-4" />
          </span>
          {!compact && <span>{copy.exit}</span>}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md rounded p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-3xl font-normal">
            {copy.title}
          </AlertDialogTitle>
          <AlertDialogDescription>{copy.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{copy.cancel}</AlertDialogCancel>
          <AlertDialogAction disabled={isLoggingOut} onClick={() => void logout()}>
            {isLoggingOut ? copy.leaving : copy.exit}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
