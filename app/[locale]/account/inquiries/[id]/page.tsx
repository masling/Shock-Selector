import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InquiryMessageForm } from "@/components/inquiry/inquiry-message-form";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { brand } from "@/lib/brand";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getInquiryPortalCopy } from "@/lib/i18n/inquiry-portal-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { getInquirySession, isInquiryPortalEnabled } from "@/lib/inquiry/inquiry-service";
import type { PublishedInquiryQuote } from "@/lib/inquiry/inquiry-repository";
import type { InquiryMessageRecord, InquiryRecord } from "@/lib/inquiry/schemas";

type InquiryDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function formatDateTime(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function getStatusLabel(copy: ReturnType<typeof getInquiryPortalCopy>, status: string) {
  if (status === "reviewing") return copy.reviewing;
  if (status === "awaiting_customer") return copy.awaiting_customer;
  if (status === "quoted") return copy.quoted;
  if (status === "closed") return copy.closed;
  return copy.received;
}

function PortalUnavailable({ locale, copy }: { locale: Locale; copy: ReturnType<typeof getInquiryPortalCopy> }) {
  return (
    <section className="surface p-6">
      <h1 className="text-2xl font-semibold text-ink">{copy.unavailableTitle}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">{copy.unavailable}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a className={buttonVariants({ variant: "accent" })} href={`mailto:${brand.email}`}>{copy.email}</a>
        <a className={buttonVariants({ variant: "secondary" })} href={brand.whatsapp.href}>{copy.whatsapp}</a>
        <Link className={buttonVariants({ variant: "secondary" })} href={getLocalizedHref(locale, "/account/inquiries/new")}>{copy.newInquiry}</Link>
      </div>
    </section>
  );
}

function SignInRequired({ id, locale, copy }: { id: string; locale: Locale; copy: ReturnType<typeof getInquiryPortalCopy> }) {
  return (
    <section className="surface p-6">
      <h1 className="text-2xl font-semibold text-ink">{copy.portalSigninTitle}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">{copy.portalSigninDescription}</p>
      <div className="mt-6">
        <Link
          className={buttonVariants({ variant: "accent" })}
          href={getLocalizedHref(locale, `/sign-in?next=${encodeURIComponent(`/${locale}/account/inquiries/${id}`)}`)}
        >
          {copy.signInToView}
        </Link>
      </div>
    </section>
  );
}

function InquirySummary({ inquiry, locale, copy }: { inquiry: InquiryRecord; locale: Locale; copy: ReturnType<typeof getInquiryPortalCopy> }) {
  return (
    <section className="surface p-5">
      <h2 className="text-lg font-semibold text-ink">{copy.requestSummary}</h2>
      <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
        <div>
          <dt className="text-steel">{copy.reference}</dt>
          <dd className="mt-1 break-words font-semibold text-ink [overflow-wrap:anywhere]">{inquiry.reference}</dd>
        </div>
        <div>
          <dt className="text-steel">{copy.status}</dt>
          <dd className="mt-1 font-semibold text-accent-dark">{getStatusLabel(copy, inquiry.status)}</dd>
        </div>
        <div>
          <dt className="text-steel">{copy.date}</dt>
          <dd className="mt-1 text-ink">{formatDateTime(inquiry.createdAt, locale)}</dd>
        </div>
        <div>
          <dt className="text-steel">{copy.updated}</dt>
          <dd className="mt-1 text-ink">{formatDateTime(inquiry.updatedAt, locale)}</dd>
        </div>
        <div>
          <dt className="text-steel">{copy.kind}</dt>
          <dd className="mt-1 text-ink">{copy[inquiry.kind]}</dd>
        </div>
        {inquiry.requestedDelivery ? (
          <div>
            <dt className="text-steel">{copy.delivery}</dt>
            <dd className="mt-1 break-words text-ink [overflow-wrap:anywhere]">{inquiry.requestedDelivery}</dd>
          </div>
        ) : null}
      </dl>
      {inquiry.originalModel ? (
        <div className="mt-4 rounded-lg bg-sand p-4 text-sm">
          <p className="font-medium text-ink">{copy.originalModel}</p>
          <p className="mt-1 break-words text-steel [overflow-wrap:anywhere]">{inquiry.originalModel}</p>
        </div>
      ) : null}
      <div className="mt-4 rounded-lg bg-sand p-4 text-sm">
        <p className="font-medium text-ink">{copy.contactDetails}</p>
        <dl className="mt-2 grid gap-2 md:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-steel">{copy.name}</dt>
            <dd className="break-words text-ink [overflow-wrap:anywhere]">{inquiry.contactName}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-steel">{copy.company}</dt>
            <dd className="break-words text-ink [overflow-wrap:anywhere]">{inquiry.company || copy.unknown}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-steel">{copy.country}</dt>
            <dd className="break-words text-ink [overflow-wrap:anywhere]">{inquiry.country}</dd>
          </div>
        </dl>
      </div>
      <div className="mt-4 rounded-lg bg-sand p-4 text-sm">
        <p className="font-medium text-ink">{copy.message}</p>
        <p className="mt-2 whitespace-pre-wrap break-words leading-7 text-steel [overflow-wrap:anywhere]">{inquiry.message}</p>
      </div>
    </section>
  );
}

function ProductRows({ inquiry, copy }: { inquiry: InquiryRecord; copy: ReturnType<typeof getInquiryPortalCopy> }) {
  if (!inquiry.items.length) return null;

  return (
    <section className="surface p-5">
      <h2 className="text-lg font-semibold text-ink">{copy.productRows}</h2>
      <div className="scroll-table mt-4">
        <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
          <thead className="text-xs text-steel">
            <tr>
              <th className="pb-2 pr-4 font-medium">{copy.model}</th>
              <th className="pb-2 pr-4 font-medium">{copy.quantity}</th>
              <th className="pb-2 font-medium">{copy.itemNote}</th>
            </tr>
          </thead>
          <tbody>
            {inquiry.items.map((item) => (
              <tr key={item.model} className="bg-sand">
                <td className="rounded-l-lg break-words px-3 py-3 font-semibold text-ink [overflow-wrap:anywhere]">{item.model}</td>
                <td className="px-3 py-3 text-ink">{item.quantity}</td>
                <td className="rounded-r-lg break-words px-3 py-3 text-steel [overflow-wrap:anywhere]">{item.note || copy.unknown}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PublishedQuote({ quote, locale }: { quote: PublishedInquiryQuote | null; locale: Locale }) {
  if (!quote) return null;

  return (
    <section className="surface p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-lg font-semibold text-ink">Published quote</h2>
        <time className="text-xs text-steel" dateTime={quote.publishedAt}>
          {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(quote.publishedAt))}
        </time>
      </div>
      <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <div>
          <dt className="text-steel">Currency</dt>
          <dd className="mt-1 font-semibold text-ink">{quote.currency}</dd>
        </div>
        <div>
          <dt className="text-steel">Validity</dt>
          <dd className="mt-1 break-words text-ink [overflow-wrap:anywhere]">{quote.validity || "—"}</dd>
        </div>
        <div>
          <dt className="text-steel">Delivery / freight term</dt>
          <dd className="mt-1 break-words text-ink [overflow-wrap:anywhere]">{quote.deliveryTerm || "—"}</dd>
        </div>
        <div>
          <dt className="text-steel">Payment term</dt>
          <dd className="mt-1 break-words text-ink [overflow-wrap:anywhere]">{quote.paymentTerm || "—"}</dd>
        </div>
      </dl>
      <div className="scroll-table mt-4">
        <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
          <thead className="text-xs text-steel">
            <tr>
              <th className="pb-2 pr-4 font-medium">Model</th>
              <th className="pb-2 pr-4 font-medium">Qty</th>
              <th className="pb-2 pr-4 font-medium">Unit price</th>
              <th className="pb-2 pr-4 font-medium">Lead time</th>
              <th className="pb-2 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {quote.lines.map((line, index) => (
              <tr key={`${line.model}-${index}`} className="bg-sand">
                <td className="rounded-l-lg break-words px-3 py-3 font-semibold text-ink [overflow-wrap:anywhere]">{line.model}</td>
                <td className="px-3 py-3 text-ink">{line.quantity}</td>
                <td className="break-words px-3 py-3 text-ink [overflow-wrap:anywhere]">{line.unitPrice || "—"}</td>
                <td className="break-words px-3 py-3 text-steel [overflow-wrap:anywhere]">{line.leadTime || "—"}</td>
                <td className="rounded-r-lg break-words px-3 py-3 text-steel [overflow-wrap:anywhere]">{line.note || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {quote.notes ? (
        <p className="mt-4 whitespace-pre-wrap break-words rounded-lg bg-sand p-4 text-sm leading-7 text-steel [overflow-wrap:anywhere]">{quote.notes}</p>
      ) : null}
    </section>
  );
}

function MessageList({ messages, locale, copy }: { messages: InquiryMessageRecord[]; locale: Locale; copy: ReturnType<typeof getInquiryPortalCopy> }) {
  return (
    <section className="surface p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-lg font-semibold text-ink">{copy.messages}</h2>
        <p className="text-xs text-steel">{copy.newestMessages}</p>
      </div>
      {messages.length ? (
        <ol className="mt-5 space-y-4">
          {messages.map((message) => (
            <li key={message.id} className="rounded-lg border border-line bg-white p-4">
              <div className="flex flex-wrap justify-between gap-3 text-xs text-steel">
                <span className="font-semibold text-ink">{message.authorRole === "staff" ? copy.staff : copy.customer}</span>
                <time dateTime={message.createdAt}>{formatDateTime(message.createdAt, locale)}</time>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-steel [overflow-wrap:anywhere]">{message.body}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-line bg-sand p-4 text-sm leading-6 text-steel">{copy.noMessages}</p>
      )}
    </section>
  );
}

export default async function InquiryDetailPage({ params }: InquiryDetailPageProps) {
  const { locale: localeParam, id } = await params;
  if (!isLocale(localeParam) || !isUuid(id)) notFound();

  const locale = localeParam as Locale;
  const copy = getInquiryPortalCopy(locale);

  if (!isInquiryPortalEnabled()) {
    return (
      <Container className="py-10 md:py-12">
        <PortalUnavailable locale={locale} copy={copy} />
      </Container>
    );
  }

  let session: Awaited<ReturnType<typeof getInquirySession>>;
  try {
    session = await getInquirySession();
  } catch {
    return (
      <Container className="py-10 md:py-12">
        <section className="surface p-6">
          <h1 className="text-2xl font-semibold text-ink">{copy.unavailableTitle}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">{copy.unavailableRecord}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a className={buttonVariants({ variant: "accent" })} href={`mailto:${brand.email}`}>{copy.email}</a>
            <a className={buttonVariants({ variant: "secondary" })} href={brand.whatsapp.href}>{copy.whatsapp}</a>
          </div>
        </section>
      </Container>
    );
  }
  if (!session) {
    return (
      <Container className="py-10 md:py-12">
        <SignInRequired id={id} locale={locale} copy={copy} />
      </Container>
    );
  }

  let detail: Awaited<ReturnType<typeof session.repository.detail>>;
  try {
    detail = await session.repository.detail(session.user.id, id);
  } catch {
    return (
      <Container className="py-10 md:py-12">
        <section className="surface p-6">
          <h1 className="text-2xl font-semibold text-ink">{copy.unavailableTitle}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">{copy.unavailableRecord}</p>
        </section>
      </Container>
    );
  }
  if (!detail) notFound();

  return (
    <Container className="py-10 md:py-12">
      <div className="mb-8 border-t border-line pt-7">
        <Link className="text-sm font-semibold text-accent-dark" href={getLocalizedHref(locale, "/account/inquiries")}>
          {copy.history}
        </Link>
        <h1 className="mt-4 break-words font-sans text-4xl font-semibold leading-tight text-ink [overflow-wrap:anywhere]">{detail.inquiry.reference}</h1>
        <p className="mt-3 text-sm leading-7 text-steel">{copy.notificationPending}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.55fr)] lg:items-start">
        <div className="space-y-6">
          <InquirySummary inquiry={detail.inquiry} locale={locale} copy={copy} />
          <ProductRows inquiry={detail.inquiry} copy={copy} />
          <PublishedQuote quote={detail.publishedQuote} locale={locale} />
          <MessageList messages={detail.messages} locale={locale} copy={copy} />
        </div>
        <InquiryMessageForm inquiryId={detail.inquiry.id} locale={locale} copy={copy} disabled={detail.inquiry.status === "closed"} />
      </div>
    </Container>
  );
}
