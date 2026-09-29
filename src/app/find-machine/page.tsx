import type { Metadata } from "next";

import FindMachinePage from "@/routes/find-machine";
import { getStorefrontViewer } from "@/server/auth";

export const dynamic = "force-dynamic";

const description =
  "Descreva o equipamento que procura, indique quantidade, orçamento e prazo, e peça uma pesquisa personalizada.";

export const metadata: Metadata = {
  title: "Encontra-me uma máquina",
  description,
  openGraph: {
    title: "Encontra-me uma máquina — Mercado B2B",
    description:
      "Diga-nos que máquina precisa e procuraremos o fornecedor certo para o seu negócio em São Tomé.",
  },
};

export default async function Page() {
  return <FindMachinePage viewer={await getStorefrontViewer()} />;
}
