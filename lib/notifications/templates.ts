import { brand } from "@/lib/brand";
import type { Locale } from "@/lib/i18n/config";
import type { TransactionalEmail } from "./smtp";

type CustomerEvent = { eventKey: string; inquiryId: string; reference: string; email: string; locale: Locale; kind: "inquiry_received" | "staff_reply" | "status_changed" | "quote_published" };
const titles: Record<Locale, Record<CustomerEvent["kind"], string>> = {
  en: { inquiry_received: "Inquiry received", staff_reply: "A reply to your inquiry", status_changed: "Your inquiry has an update", quote_published: "Your quotation is available" },
  "zh-cn": { inquiry_received: "已收到您的询盘", staff_reply: "您的询盘有新回复", status_changed: "您的询盘有进展", quote_published: "您的报价已提供" },
  de: { inquiry_received: "Anfrage eingegangen", staff_reply: "Eine Antwort auf Ihre Anfrage", status_changed: "Ihre Anfrage wurde aktualisiert", quote_published: "Ihr Angebot ist verfügbar" },
  fr: { inquiry_received: "Demande reçue", staff_reply: "Une réponse à votre demande", status_changed: "Votre demande a été mise à jour", quote_published: "Votre devis est disponible" },
  it: { inquiry_received: "Richiesta ricevuta", staff_reply: "Una risposta alla tua richiesta", status_changed: "Aggiornamento della tua richiesta", quote_published: "Il tuo preventivo è disponibile" },
};
const view: Record<Locale, string> = { en: "Sign in to view the latest information and reply:", "zh-cn": "登录后查看最新信息并回复：", de: "Melden Sie sich an, um die neuesten Informationen anzusehen und zu antworten:", fr: "Connectez-vous pour consulter les informations et répondre :", it: "Accedi per visualizzare gli aggiornamenti e rispondere:" };

export function customerNotification(event: CustomerEvent): TransactionalEmail {
  const title = titles[event.locale][event.kind];
  return {
    eventKey: event.eventKey, to: event.email, subject: `${brand.name} · ${title} · ${event.reference}`,
    // Keep private technical data, prices and internal notes out of email bodies.
    text: `${title}\n${event.reference}\n\n${view[event.locale]}\n${brand.website}/${event.locale}/account/inquiries/${encodeURIComponent(event.inquiryId)}\n\n${brand.name}\n${brand.email}`,
  };
}
