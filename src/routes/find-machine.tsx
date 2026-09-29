"use client";
import { ImagePlus, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { StoreFooter, StoreHeader, useStoreLocale } from "@/components/storefront";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { MaskedInput, maskFormatters } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const copy = {
  pt: {
    overline: "PESQUISA À MEDIDA",
    title: "“Preciso desta máquina.",
    italic: "Encontra-me.”",
    intro:
      "Não encontra o que precisa? Envie-nos os detalhes e procuramos o fornecedor certo para si.",
    photo: "Fotografia",
    photoHint: "Adicionar fotografia",
    desc: "Descrição",
    descPh: "Ex.: máquina de fazer blocos de cimento, manual",
    qty: "Quantidade",
    budget: "Orçamento (EUR)",
    deadline: "Prazo pretendido",
    deadlinePh: "Ex.: até dezembro",
    send: "Enviar pedido",
    photoNote: "A fotografia ainda não será guardada.",
    pending: "Os pedidos serão ligados ao novo banco na próxima etapa.",
  },
  en: {
    overline: "CUSTOM SOURCING",
    title: "“I need this machine.",
    italic: "Find it for me.”",
    intro:
      "Can't find what you need? Send us the details and we'll find the right supplier for you.",
    photo: "Photo",
    photoHint: "Add photo",
    desc: "Description",
    descPh: "E.g. manual cement block making machine",
    qty: "Quantity",
    budget: "Budget (EUR)",
    deadline: "Desired deadline",
    deadlinePh: "E.g. by December",
    send: "Send request",
    photoNote: "The photo will not be saved yet.",
    pending: "Requests will be connected to the new database in the next step.",
  },
};

export default function FindMachinePage() {
  const { locale, changeLocale } = useStoreLocale();
  const t = copy[locale];
  const [req, setReq] = useState({ desc: "", qty: "", budget: "" });
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [photo, setPhoto] = useState<string | null>(null);
  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo);
    },
    [photo],
  );
  const sendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info(t.pending);
  };
  return (
    <main className="min-h-screen bg-background text-foreground">
      <StoreHeader locale={locale} onLocaleChange={changeLocale} />
      <section className="min-h-[calc(100vh-5rem)] bg-store-mint px-5 pb-24 pt-36 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-[1350px] gap-14 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-[10px] font-medium uppercase tracking-[.28em] text-muted-foreground">
              {t.overline}
            </p>
            <h1 className="text-5xl font-light leading-tight sm:text-6xl">
              {t.title}
              <br />
              <em className="font-display">{t.italic}</em>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-muted-foreground">{t.intro}</p>
          </div>
          <form onSubmit={sendRequest} className="space-y-6 bg-card p-7 sm:p-10">
            <label className="flex cursor-pointer items-center gap-4 border border-dashed border-border p-4">
              {photo ? (
                <img src={photo} alt="" className="size-16 object-cover" />
              ) : (
                <span className="grid size-16 place-items-center bg-store-paper">
                  <ImagePlus className="size-5 text-muted-foreground" />
                </span>
              )}
              <span>
                <span className="block text-[10px] font-semibold uppercase tracking-widest">
                  {t.photo}
                </span>
                <span className="text-xs text-muted-foreground">{t.photoHint}</span>
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setPhoto(f ? URL.createObjectURL(f) : null);
                }}
              />
            </label>
            <Textarea
              label={t.desc}
              required
              rows={3}
              value={req.desc}
              onChange={(e) => setReq({ ...req, desc: e.target.value })}
              placeholder={t.descPh}
              textareaClassName="rounded-none border-x-0 border-t-0 bg-transparent px-0 shadow-none focus:ring-0"
            />
            <div className="grid gap-6 sm:grid-cols-3">
              <MaskedInput
                label={t.qty}
                required
                value={req.qty}
                onChange={(e) => setReq({ ...req, qty: e.target.value })}
                mask={maskFormatters.integer}
                inputMode="numeric"
                suffix="un."
                controlClassName="rounded-none border-x-0 border-t-0 bg-transparent px-0 shadow-none focus-within:ring-0"
              />
              <MaskedInput
                label={t.budget}
                value={req.budget}
                onChange={(e) => setReq({ ...req, budget: e.target.value })}
                mask={maskFormatters.money}
                inputMode="numeric"
                prefix="€"
                controlClassName="rounded-none border-x-0 border-t-0 bg-transparent px-0 shadow-none focus-within:ring-0"
              />
              <DatePicker
                label={t.deadline}
                value={deadline}
                onChange={setDeadline}
                locale={locale}
                placeholder={t.deadlinePh}
                triggerClassName="rounded-none border-x-0 border-t-0 bg-transparent px-0 shadow-none"
              />
            </div>
            <Button
              type="submit"
              className="h-12 w-full rounded-none text-[10px] uppercase tracking-widest"
            >
              <Send />
              {t.send}
            </Button>
            {photo && (
              <p className="text-center text-[10px] text-muted-foreground">{t.photoNote}</p>
            )}
          </form>
        </div>
      </section>
      <StoreFooter locale={locale} />
    </main>
  );
}
