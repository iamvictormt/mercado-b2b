import type { StaticImageData } from "next/image";

export type StoreLocale = "pt" | "en";

type LocalizedText = Record<StoreLocale, string>;

export type Product = {
  id: string;
  slug: string;
  name: LocalizedText;
  category: string;
  categoryName: LocalizedText;
  image: StaticImageData | { src: string; width: number; height: number };
  /** Preço indicativo na moeda definida para o produto. */
  price: number;
  oldPrice?: number;
  detail: LocalizedText;
  description: LocalizedText;
  origin: LocalizedText;
  leadTime: LocalizedText;
  minQty: number;
  unit: LocalizedText;
  featured: boolean;
  currency?: string;
};

export function formatMoney(value: number, locale: StoreLocale, currency = "EUR") {
  return new Intl.NumberFormat(locale === "pt" ? "pt-PT" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
