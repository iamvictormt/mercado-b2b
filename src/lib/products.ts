import fridgeImage from "@/assets/b2b-fridge.jpg";
import grinderImage from "@/assets/b2b-grinder.jpg";
import plotterImage from "@/assets/b2b-plotter.jpg";
import posImage from "@/assets/b2b-pos.jpg";
import printerImage from "@/assets/b2b-printer.jpg";
import sprayerImage from "@/assets/b2b-sprayer.jpg";
import type { StaticImageData } from "next/image";

export type StoreLocale = "pt" | "en";
export type ProductCategory = "office" | "print" | "agro" | "business" | "other";

type L = Record<StoreLocale, string>;

export type Product = {
  id: number | string;
  slug: string;
  name: L;
  category: ProductCategory;
  categoryName: L;
  image: StaticImageData | { src: string; width: number; height: number };
  /** Preço indicativo em EUR (já inclui a margem da plataforma) */
  price: number;
  oldPrice?: number;
  detail: L;
  description: L;
  origin: L;
  leadTime: L;
  minQty: number;
  unit: L;
  featured: number;
  currency?: string;
};

export const categoryNames: Record<ProductCategory, L> = {
  office: { pt: "Escritórios", en: "Offices" },
  print: { pt: "Gráficas e comunicação", en: "Print & communication" },
  agro: { pt: "Agro-negócios", en: "Agribusiness" },
  business: { pt: "Pequenos negócios", en: "Small businesses" },
  other: { pt: "Outros", en: "Other" },
};

const c = (k: ProductCategory) => ({ category: k, categoryName: categoryNames[k] });

export const products: Product[] = [
  {
    id: 1,
    slug: "impressora-multifuncoes-laser",
    name: { pt: "Impressora multifunções laser", en: "Laser multifunction printer" },
    ...c("office"),
    image: printerImage,
    price: 420,
    detail: { pt: "Imprime, copia e digitaliza", en: "Print, copy and scan" },
    description: {
      pt: "Multifunções A4 robusta para escritórios com volume médio de impressão, com rede e digitalização frente e verso.",
      en: "Robust A4 multifunction for offices with medium print volume, network-ready with duplex scanning.",
    },
    origin: { pt: "China", en: "China" },
    leadTime: { pt: "4–6 semanas", en: "4–6 weeks" },
    minQty: 1,
    unit: { pt: "unidade", en: "unit" },
    featured: 6,
  },
  {
    id: 2,
    slug: "plotter-grande-formato",
    name: { pt: "Plotter de grande formato 1,6 m", en: "1.6 m large-format plotter" },
    ...c("print"),
    image: plotterImage,
    price: 6800,
    detail: { pt: "Lonas, vinil e cartazes", en: "Banners, vinyl and posters" },
    description: {
      pt: "Impressão eco-solvente para lonas, autocolantes e sinalética. Ideal para gráficas que querem produzir localmente.",
      en: "Eco-solvent printing for banners, stickers and signage. Ideal for print shops producing locally.",
    },
    origin: { pt: "China", en: "China" },
    leadTime: { pt: "6–8 semanas", en: "6–8 weeks" },
    minQty: 1,
    unit: { pt: "unidade", en: "unit" },
    featured: 5,
  },
  {
    id: 3,
    slug: "pulverizador-motorizado",
    name: { pt: "Pulverizador motorizado 20 L", en: "20 L motorised sprayer" },
    ...c("agro"),
    image: sprayerImage,
    price: 165,
    detail: { pt: "Motor a 4 tempos", en: "4-stroke engine" },
    description: {
      pt: "Pulverizador de dorso para plantações de cacau, café e hortícolas, com motor a gasolina e lança regulável.",
      en: "Backpack sprayer for cocoa, coffee and vegetable plantations, with petrol engine and adjustable lance.",
    },
    origin: { pt: "China", en: "China" },
    leadTime: { pt: "5–7 semanas", en: "5–7 weeks" },
    minQty: 5,
    unit: { pt: "unidades", en: "units" },
    featured: 4,
  },
  {
    id: 4,
    slug: "secador-moinho-cacau",
    name: { pt: "Secador e moinho de cacau", en: "Cocoa dryer and grinder" },
    ...c("agro"),
    image: grinderImage,
    price: 2350,
    detail: { pt: "Aço inoxidável", en: "Stainless steel" },
    description: {
      pt: "Equipamento compacto para secar e moer cacau, acrescentando valor à produção local antes da venda.",
      en: "Compact equipment to dry and grind cocoa, adding value to local production before sale.",
    },
    origin: { pt: "Índia", en: "India" },
    leadTime: { pt: "8–10 semanas", en: "8–10 weeks" },
    minQty: 1,
    unit: { pt: "unidade", en: "unit" },
    featured: 3,
  },
  {
    id: 5,
    slug: "vitrine-refrigerada",
    name: { pt: "Vitrine refrigerada para bebidas", en: "Beverage display fridge" },
    ...c("business"),
    image: fridgeImage,
    price: 780,
    detail: { pt: "Porta de vidro, 400 L", en: "Glass door, 400 L" },
    description: {
      pt: "Frigorífico vertical para lojas, bares e mercearias, com iluminação LED e baixo consumo.",
      en: "Upright fridge for shops, bars and grocery stores, with LED lighting and low consumption.",
    },
    origin: { pt: "Portugal", en: "Portugal" },
    leadTime: { pt: "3–5 semanas", en: "3–5 weeks" },
    minQty: 1,
    unit: { pt: "unidade", en: "unit" },
    featured: 2,
  },
  {
    id: 6,
    slug: "kit-caixa-pos",
    name: { pt: "Kit caixa POS completo", en: "Complete POS kit" },
    ...c("business"),
    image: posImage,
    price: 590,
    detail: { pt: "Ecrã tátil, impressora e gaveta", en: "Touchscreen, printer and drawer" },
    description: {
      pt: "Sistema de ponto de venda pronto a usar para registar vendas, emitir talões e controlar stock.",
      en: "Ready-to-use point-of-sale system to record sales, print receipts and track stock.",
    },
    origin: { pt: "Emirados Árabes Unidos", en: "United Arab Emirates" },
    leadTime: { pt: "3–4 semanas", en: "3–4 weeks" },
    minQty: 1,
    unit: { pt: "kit", en: "kit" },
    featured: 1,
  },
];

export function formatMoney(value: number, locale: StoreLocale, currency = "EUR") {
  return new Intl.NumberFormat(locale === "pt" ? "pt-PT" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
