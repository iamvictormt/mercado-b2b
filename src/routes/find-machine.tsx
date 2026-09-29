"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ImagePlus, LoaderCircle, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  StoreFooter,
  StoreHeader,
  type StorefrontViewer,
  useStoreLocale,
} from "@/components/storefront";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { MaskedInput, maskFormatters } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const copy = {
  pt: {
    overline: "Pesquisa à medida",
    title: "Não encontra a máquina",
    italic: "que o seu negócio precisa?",
    intro:
      "Descreva o equipamento. Nós pesquisamos, validamos o fornecedor e apresentamos uma cotação clara para entrega em São Tomé.",
    formOverline: "Novo pedido",
    formTitle: "Conte-nos o que procura.",
    formIntro:
      "Quanto mais precisa for a descrição, mais rapidamente conseguimos comparar fornecedores.",
    photo: "Fotografia de referência",
    photoHint: "JPEG, PNG, WebP ou AVIF · máximo 8 MB",
    photoOptional: "Opcional",
    replace: "Trocar fotografia",
    desc: "Descrição do equipamento",
    descPh: "Ex.: máquina manual para fabricar blocos de cimento, produção de 800 blocos por dia…",
    qty: "Quantidade",
    budget: "Orçamento indicativo",
    deadline: "Data pretendida",
    deadlinePh: "Selecionar data",
    send: "Enviar pedido",
    sending: "A enviar pedido...",
    adminAction: "Ver pedidos no painel",
    note: "O pedido não representa compromisso de compra. Entraremos em contacto antes de qualquer pagamento.",
    login: "Inicie sessão para enviar um pedido de pesquisa.",
    success: "Pedido enviado com sucesso.",
    process: [
      ["01", "Descreve", "Partilhe função, capacidade, quantidade e orçamento."],
      ["02", "Comparamos", "Procuramos opções e verificamos fornecedores."],
      ["03", "Decide", "Recebe uma proposta completa antes de avançar."],
    ],
  },
  en: {
    overline: "Custom sourcing",
    title: "Can't find the machine",
    italic: "your business needs?",
    intro:
      "Describe the equipment. We research, validate the supplier and present a clear quotation for delivery in São Tomé.",
    formOverline: "New request",
    formTitle: "Tell us what you need.",
    formIntro: "The more precise the description, the faster we can compare suitable suppliers.",
    photo: "Reference image",
    photoHint: "JPEG, PNG, WebP or AVIF · maximum 8 MB",
    photoOptional: "Optional",
    replace: "Replace image",
    desc: "Equipment description",
    descPh: "E.g. manual cement block machine, production of 800 blocks per day…",
    qty: "Quantity",
    budget: "Indicative budget",
    deadline: "Desired date",
    deadlinePh: "Select date",
    send: "Send request",
    sending: "Sending request...",
    adminAction: "View requests in dashboard",
    note: "This request is not a purchase commitment. We will contact you before any payment.",
    login: "Sign in to send a sourcing request.",
    success: "Request sent successfully.",
    process: [
      ["01", "Describe", "Share the function, capacity, quantity and budget."],
      ["02", "We compare", "We find options and verify suppliers."],
      ["03", "You decide", "You receive a complete proposal before proceeding."],
    ],
  },
};

async function responseError(response: Response) {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return body?.error ?? "Não foi possível concluir o pedido.";
}

function parseMoney(value: string) {
  if (!value.trim()) return null;
  return Number(value.replaceAll(" ", "").replace(",", "."));
}

export default function FindMachinePage({ viewer }: { viewer: StorefrontViewer | null }) {
  const { locale, changeLocale } = useStoreLocale();
  const t = copy[locale];
  const [request, setRequest] = useState({ description: "", quantity: "", budget: "" });
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(
    () => () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    },
    [photoPreview],
  );

  const choosePhoto = (file: File | undefined) => {
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const sendRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (viewer?.role === "ADMIN") {
      toast.info(t.adminAction);
      return;
    }
    setSending(true);

    try {
      let imageUrl: string | null = null;
      let imagePublicId: string | null = null;

      if (photoFile) {
        const uploadBody = new FormData();
        uploadBody.set("file", photoFile);
        uploadBody.set("folder", "sourcing");
        const uploadResponse = await fetch("/api/uploads/cloudinary", {
          method: "POST",
          body: uploadBody,
        });
        if (!uploadResponse.ok) throw new Error(await responseError(uploadResponse));
        const upload = (await uploadResponse.json()) as {
          image: { url: string; publicId: string };
        };
        imageUrl = upload.image.url;
        imagePublicId = upload.image.publicId;
      }

      const response = await fetch("/api/sourcing-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          description: request.description,
          quantity: request.quantity ? Number(request.quantity) : null,
          budget: parseMoney(request.budget),
          currency: "EUR",
          desiredBy: deadline ? deadline.toISOString().slice(0, 10) : null,
          imageUrl,
          imagePublicId,
        }),
      });

      if (response.status === 401) throw new Error(t.login);
      if (!response.ok) throw new Error(await responseError(response));
      const body = (await response.json()) as { sourcingRequest: { number: string } };
      toast.success(`${t.success} ${body.sourcingRequest.number}`);
      setRequest({ description: "", quantity: "", budget: "" });
      setDeadline(undefined);
      removePhoto();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar o pedido.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <StoreHeader locale={locale} onLocaleChange={changeLocale} viewer={viewer} />

      <section className="relative overflow-hidden border-b border-border bg-store-paper pb-20 pt-36 lg:pb-24">
        <div className="absolute -right-40 top-0 size-[620px] rounded-full border border-border/70 bg-store-mint/70" />
        <div className="absolute right-[18%] top-1/2 size-3 rounded-full bg-primary" />
        <div className="relative mx-auto grid max-w-[1500px] gap-14 px-5 sm:px-10 lg:grid-cols-[1.08fr_.92fr] lg:items-end lg:px-16">
          <div>
            <p className="mb-6 text-[10px] font-medium uppercase tracking-[.28em] text-muted-foreground">
              {t.overline}
            </p>
            <h1 className="max-w-4xl text-5xl font-light leading-[.98] sm:text-7xl lg:text-[5.4rem]">
              {t.title}
              <br />
              <em className="font-display font-normal">{t.italic}</em>
            </h1>
            <p className="mt-8 max-w-xl text-sm leading-7 text-muted-foreground">{t.intro}</p>
          </div>

          <div className="relative border-t border-border bg-background/65 backdrop-blur-sm">
            {t.process.map(([number, title, description]) => (
              <article
                key={number}
                className="grid grid-cols-[52px_1fr] gap-4 border-b border-border py-5 sm:grid-cols-[52px_120px_1fr]"
              >
                <span className="font-display text-xl italic text-muted-foreground">{number}</span>
                <h2 className="text-xs font-semibold uppercase tracking-[.14em]">{title}</h2>
                <p className="col-start-2 text-xs leading-5 text-muted-foreground sm:col-start-3">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-12 px-5 py-20 sm:px-10 lg:grid-cols-[.68fr_1.32fr] lg:px-16 lg:py-24">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[10px] font-medium uppercase tracking-[.28em] text-muted-foreground">
            {t.formOverline}
          </p>
          <h2 className="mt-4 max-w-md font-display text-5xl italic sm:text-6xl">{t.formTitle}</h2>
          <p className="mt-6 max-w-sm text-sm leading-7 text-muted-foreground">{t.formIntro}</p>
          <div className="mt-10 hidden size-24 place-items-center rounded-full border border-border bg-store-mint text-muted-foreground lg:grid">
            <Search className="size-7" />
          </div>
        </div>

        <form onSubmit={sendRequest} className="border border-border bg-card">
          <div className="border-b border-border p-5 sm:p-8">
            <label className="group relative flex min-h-52 cursor-pointer items-center justify-center overflow-hidden border border-dashed border-border bg-store-paper p-5 text-center">
              {photoPreview ? (
                <>
                  <img
                    src={photoPreview}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                  />
                  <span className="absolute inset-0 bg-foreground/10 transition-colors group-hover:bg-foreground/20" />
                  <span className="relative bg-background/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest backdrop-blur">
                    {t.replace}
                  </span>
                </>
              ) : (
                <span>
                  <span className="mx-auto grid size-14 place-items-center rounded-full border border-border bg-background">
                    <ImagePlus className="size-5 text-muted-foreground" />
                  </span>
                  <span className="mt-4 block text-[10px] font-semibold uppercase tracking-[.18em]">
                    {t.photo}
                  </span>
                  <span className="mt-2 block text-xs text-muted-foreground">{t.photoHint}</span>
                  <span className="mt-1 block text-[9px] uppercase tracking-widest text-muted-foreground">
                    {t.photoOptional}
                  </span>
                </span>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                onChange={(event) => choosePhoto(event.target.files?.[0])}
              />
            </label>
            {photoPreview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 ml-auto flex gap-2 text-xs"
                onClick={removePhoto}
              >
                <X className="size-3.5" /> {locale === "pt" ? "Remover fotografia" : "Remove image"}
              </Button>
            )}
          </div>

          <div className="space-y-7 p-5 sm:p-8">
            <Textarea
              label={t.desc}
              required
              rows={5}
              minLength={10}
              value={request.description}
              onChange={(event) => setRequest({ ...request, description: event.target.value })}
              placeholder={t.descPh}
              textareaClassName="min-h-40 rounded-none border-x-0 border-t-0 bg-transparent px-0 text-base shadow-none focus:ring-0"
            />

            <div className="grid gap-6 sm:grid-cols-3">
              <MaskedInput
                label={t.qty}
                value={request.quantity}
                onChange={(event) => setRequest({ ...request, quantity: event.target.value })}
                mask={maskFormatters.integer}
                inputMode="numeric"
                maxLength={9}
                suffix="un."
                controlClassName="h-12 min-h-12 rounded-none border-x-0 border-t-0 bg-transparent px-0 shadow-none focus-within:ring-0"
              />
              <MaskedInput
                label={t.budget}
                value={request.budget}
                onChange={(event) => setRequest({ ...request, budget: event.target.value })}
                mask={maskFormatters.decimalMoney}
                inputMode="decimal"
                maxLength={18}
                prefix="€"
                controlClassName="h-12 min-h-12 rounded-none border-x-0 border-t-0 bg-transparent px-0 shadow-none focus-within:ring-0"
              />
              <DatePicker
                label={t.deadline}
                value={deadline}
                onChange={setDeadline}
                locale={locale}
                placeholder={t.deadlinePh}
                triggerClassName="h-12 rounded-none border-x-0 border-t-0 bg-transparent px-0 shadow-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-5 border-t border-border bg-store-paper/60 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <p className="flex max-w-lg items-start gap-2 text-[11px] leading-5 text-muted-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
              {t.note}
            </p>
            {viewer?.role === "ADMIN" ? (
              <Button
                asChild
                className="h-13 shrink-0 rounded-none px-7 text-[10px] uppercase tracking-[.18em]"
              >
                <Link href="/admin/sourcing">
                  <ArrowRight /> {t.adminAction}
                </Link>
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={sending}
                className="h-13 shrink-0 rounded-none px-7 text-[10px] uppercase tracking-[.18em]"
              >
                {sending ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}
                {sending ? t.sending : t.send}
              </Button>
            )}
          </div>
        </form>
      </section>

      <StoreFooter locale={locale} />
    </main>
  );
}
