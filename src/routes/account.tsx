"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PanelActions } from "@/components/panel-actions";
import { Button } from "@/components/ui/button";
import { Input, MaskedInput, maskFormatters } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney, products } from "@/lib/products";
import { cn } from "@/lib/utils";

type Tab = "quotes" | "sourcing" | "profile" | "favorites";

const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: "quotes", label: "Minhas cotações", icon: FileText },
  { id: "sourcing", label: "Pedidos de pesquisa", icon: Search },
  { id: "profile", label: "Dados da empresa", icon: UserRound },
  { id: "favorites", label: "Favoritos", icon: Heart },
];

const steps = ["Em análise", "Cotado", "Em importação", "Entregue"];

const myQuotes = [
  {
    id: "#C-1048",
    date: "24/09/2026",
    status: "Em análise",
    items: [{ product: products[1], qty: 1 }],
  },
  {
    id: "#C-1031",
    date: "02/09/2026",
    status: "Em importação",
    items: [{ product: products[4], qty: 2 }],
  },
  {
    id: "#C-1012",
    date: "15/08/2026",
    status: "Entregue",
    items: [{ product: products[5], qty: 1 }],
  },
];

const mySourcing = [
  {
    id: "#B-031",
    request: "Máquina de gelo industrial 50 kg/dia",
    budget: "€1.500",
    deadline: "60 dias",
    status: "Em busca",
  },
  {
    id: "#B-024",
    request: "Gerador silencioso 10 kVA",
    budget: "€2.800",
    deadline: "75 dias",
    status: "Fornecedor encontrado",
  },
];

export default function AccountPage() {
  const [tab, setTab] = useState<Tab>("quotes");
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const nav = (mini = false) => (
    <nav className="mt-6 flex flex-col gap-2 lg:mt-12">
      {tabs.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          type="button"
          variant="ghost"
          onClick={() => {
            setTab(id);
            setMenuOpen(false);
          }}
          title={mini ? label : undefined}
          aria-label={mini ? label : undefined}
          className={cn(
            "h-11 w-full shrink-0 gap-3 rounded px-3 text-sm",
            mini ? "justify-center" : "justify-start",
            tab === id
              ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background"
              : "hover:bg-background/70",
          )}
        >
          <Icon className="size-4" /> {!mini && label}
        </Button>
      ))}
    </nav>
  );

  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground lg:grid",
        collapsed ? "lg:grid-cols-[72px_minmax(0,1fr)]" : "lg:grid-cols-[280px_minmax(0,1fr)]",
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-store-mint/60 px-5 py-4 lg:hidden">
        <Link href="/" className="flex flex-col">
          <span className="font-display text-2xl italic leading-tight">Mercado B2B</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            cliente
          </span>
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="size-6" />
        </Button>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu da conta"
        >
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-store-mint shadow-xl">
            <div className="flex items-start justify-between p-5">
              <Link href="/" className="flex flex-col gap-1" onClick={() => setMenuOpen(false)}>
                <span className="font-display text-2xl italic leading-tight">Mercado B2B</span>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  cliente
                </span>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
              >
                <X className="size-5" />
              </Button>
            </div>
            <div className="px-5">{nav()}</div>
            <PanelActions onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <aside
        className={cn(
          "hidden border-r border-border bg-store-mint/60 lg:flex lg:min-h-screen lg:flex-col",
          collapsed ? "lg:w-[72px]" : "lg:w-[280px]",
        )}
      >
        <div className={collapsed ? "p-3" : "p-8"}>
          <div
            className={cn(
              "flex items-start",
              collapsed ? "flex-col items-center gap-5" : "justify-between gap-2",
            )}
          >
            <Link href="/" title="Mercado B2B" className="flex flex-col gap-1">
              <span className="font-display text-2xl italic leading-tight">
                {collapsed ? "M" : "Mercado B2B"}
              </span>
              {!collapsed && (
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  cliente
                </span>
              )}
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? "Expandir menu" : "Minimizar menu"}
              title={collapsed ? "Expandir menu" : "Minimizar menu"}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </Button>
          </div>
          {nav(collapsed)}
        </div>
        <PanelActions compact={collapsed} />
      </aside>

      <main className="min-w-0 p-5 sm:p-8 lg:p-12">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Área do cliente · Gráfica Central
          </p>
          <h1 className="font-display text-5xl">{tabs.find((item) => item.id === tab)?.label}</h1>
        </div>

        <div>
          {tab === "quotes" && (
            <div className="space-y-4">
              {myQuotes.map((o) => {
                const current = steps.indexOf(o.status);
                const total = o.items.reduce((s, it) => s + (it.product?.price ?? 0) * it.qty, 0);
                return (
                  <div key={o.id} className="rounded border border-border bg-card p-5 sm:p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium">
                        Cotação {o.id}{" "}
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          {o.date}
                        </span>
                      </p>
                      <p className="font-display text-2xl">{formatMoney(total, "pt")}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {o.items.map(
                        (it) =>
                          it.product && (
                            <Link
                              key={it.product.id}
                              href={`/product/${it.product.slug}`}
                              className="flex items-center gap-3 rounded bg-store-mint/60 p-2 pr-4 text-sm"
                            >
                              <img
                                src={it.product.image.src}
                                alt={it.product.name.pt}
                                className="size-12 rounded object-cover"
                              />
                              {it.product.name.pt} × {it.qty}
                            </Link>
                          ),
                      )}
                    </div>
                    <div className="mt-6 grid grid-cols-4 gap-2">
                      {steps.map((s, i) => (
                        <div key={s}>
                          <div
                            className={cn("h-1 rounded", i <= current ? "bg-primary" : "bg-muted")}
                          />
                          <p
                            className={cn(
                              "mt-2 text-xs",
                              i <= current ? "text-foreground" : "text-muted-foreground",
                            )}
                          >
                            {s}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "sourcing" && (
            <div className="space-y-4">
              {mySourcing.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded border border-border bg-card p-5"
                >
                  <div>
                    <p className="font-medium">
                      {r.request}{" "}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">{r.id}</span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Orçamento {r.budget} · prazo {r.deadline}
                    </p>
                  </div>
                  <span className="rounded bg-store-blue/15 px-3 py-1 text-xs">{r.status}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "profile" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast.error("Dados não guardados: esta área ainda é apenas visual.");
              }}
              className="grid max-w-2xl gap-4 sm:grid-cols-2"
            >
              <Input label="Nome da empresa" defaultValue="Gráfica Central, Lda" />
              <Input label="Pessoa de contacto" defaultValue="Ana Souza" />
              <Input label="E-mail" type="email" defaultValue="grafica.central@email.com" />
              <MaskedInput
                label="Telefone / WhatsApp"
                prefix="+239"
                defaultValue="990 0001"
                mask={maskFormatters.stpPhone}
                inputMode="numeric"
              />
              <Textarea
                label="Morada"
                defaultValue="Av. Marginal 12 de Julho — São Tomé"
                rows={2}
                className="sm:col-span-2"
              />
              <div className="flex items-center gap-4 sm:col-span-2">
                <Button type="submit">Guardar alterações</Button>
                <span className="text-xs text-muted-foreground">Disponível em breve</span>
              </div>
            </form>
          )}

          {tab === "favorites" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[products[0], products[3], products[5]].map(
                (p) =>
                  p && (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      className="group rounded border border-border bg-card p-4"
                    >
                      <div className="relative aspect-square overflow-hidden rounded bg-store-mint">
                        <img
                          src={p.image.src}
                          alt={p.name.pt}
                          className="size-full object-cover transition-transform group-hover:scale-105"
                        />
                        <Heart className="absolute right-3 top-3 size-5 fill-store-coral text-store-coral" />
                      </div>
                      <p className="mt-3 font-medium">{p.name.pt}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatMoney(p.price, "pt")} · {p.origin.pt}
                      </p>
                    </Link>
                  ),
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
