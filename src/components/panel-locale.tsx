"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { StoreLocale } from "@/lib/products";

const PanelLocaleContext = createContext<StoreLocale>("pt");

export function PanelLocaleProvider({
  locale,
  children,
}: {
  locale: StoreLocale;
  children: ReactNode;
}) {
  return <PanelLocaleContext.Provider value={locale}>{children}</PanelLocaleContext.Provider>;
}

export function usePanelLocale() {
  return useContext(PanelLocaleContext);
}
