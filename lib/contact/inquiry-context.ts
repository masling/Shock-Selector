import { z } from "zod";
import type { Locale } from "@/lib/i18n/config";
import { getLocalizedHref } from "@/lib/i18n/routing";

export type InquirySearchParams = { models?: string | string[]; request?: string | string[] };
const requestSchema = z.enum(["replacement", "project"]);
const briefCopy: Record<Locale, { models: string; replacement: string; project: string }> = {
  en: { models: "Inquiry models", replacement: "Replacement review\nExisting brand/model:\nApplication and reason for replacement:", project: "Application review\nEquipment/application:\nOperating conditions:\nMounting constraints:" },
  "zh-cn": { models: "询盘型号", replacement: "替换型号评估\n现有品牌/型号：\n应用场景及替换原因：", project: "工程应用需求\n设备/应用场景：\n运行工况：\n安装限制：" },
  de: { models: "Angefragte Modelle", replacement: "Prüfung eines Ersatzmodells\nVorhandene Marke/Modell:\nAnwendung und Grund für den Austausch:", project: "Technische Anwendungsprüfung\nMaschine/Anwendung:\nBetriebsbedingungen:\nEinbaubedingungen:" },
  fr: { models: "Modèles demandés", replacement: "Évaluation d'un remplacement\nMarque/modèle existant :\nApplication et motif du remplacement :", project: "Examen de l'application\nÉquipement/application :\nConditions de fonctionnement :\nContraintes de montage :" },
  it: { models: "Modelli richiesti", replacement: "Valutazione di una sostituzione\nMarca/modello esistente:\nApplicazione e motivo della sostituzione:", project: "Valutazione dell'applicazione\nMacchina/applicazione:\nCondizioni operative:\nVincoli di montaggio:" },
};
const firstValue = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;

export function getInquiryInitialMessage(params: InquirySearchParams, locale: Locale) {
  const copy = briefCopy[locale];
  const parsedRequest = requestSchema.safeParse(firstValue(params.request));
  const models = (firstValue(params.models) ?? "").slice(0, 1000).split(",").map((model) => model.trim()).filter(Boolean);
  return [parsedRequest.success ? copy[parsedRequest.data] : "", models.length ? `${copy.models}: ${models.join(", ")}` : ""].filter(Boolean).join("\n\n");
}

export function getInquiryRequestHref(locale: Locale, request: z.infer<typeof requestSchema>) {
  return getLocalizedHref(locale, `/contact?${new URLSearchParams({ request })}`);
}
