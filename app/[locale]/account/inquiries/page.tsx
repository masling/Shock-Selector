import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { brand } from "@/lib/brand";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getInquiryPortalCopy } from "@/lib/i18n/inquiry-portal-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { getInquirySession, isInquiryPortalEnabled } from "@/lib/inquiry/inquiry-service";
import type { InquiryRecord } from "@/lib/inquiry/schemas";

type InquiriesPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const pageSize = 20;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | string[] | undefined) {
  const page = Number(firstValue(value) ?? 1);
  return Number.isInteger(page) && page > 0 && page <= 10000 ? page : 1;
}

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}

function getStatusLabel(copy: ReturnType<typeof getInquiryPortalCopy>, status: string) {
  if (status === "reviewing") return copy.reviewing;
  if (status === "awaiting_customer") return copy.awaiting_customer;
  if (status === "quoted") return copy.quoted;
  if (status === "closed") return copy.closed;
  return copy.received;
}

function UnavailablePanel({ locale, copy }: { locale: Locale; copy: ReturnType<typeof getInquiryPortalCopy> }) {
  return (
    <section className="surface p-6">
      <h1 className="text-2xl font-semibold text-ink">{copy.unavailableTitle}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">{copy.unavailable}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a className={buttonVariants({ variant: "accent" })} href={`mailto:${brand.email}`}>
          {copy.email}
        </a>
        <a className={buttonVariants({ variant: "secondary" })} href={brand.whatsapp.href}>
          {copy.whatsapp}
        </a>
        <Link className={buttonVariants({ variant: "secondary" })} href={getLocalizedHref(locale, "/account/inquiries/new")}>
          {copy.newInquiry}
        </Link>
      </div>
    </section>
  );
}

function SignInPanel({ locale, copy }: { locale: Locale; copy: ReturnType<typeof getInquiryPortalCopy> }) {
  return (
    <section className="surface p-6">
      <h1 className="text-2xl font-semibold text-ink">{copy.portalSigninTitle}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">{copy.portalSigninDescription}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          className={buttonVariants({ variant: "accent" })}
          href={getLocalizedHref(locale, `/sign-in?next=${encodeURIComponent(`/${locale}/account/inquiries`)}`)}
        >
          {copy.signInToView}
        </Link>
        <Link className={buttonVariants({ variant: "secondary" })} href={getLocalizedHref(locale, "/account/inquiries/new")}>
          {copy.newInquiry}
        </Link>
      </div>
    </section>
  );
}

function InquiryRow({ inquiry, locale, copy }: { inquiry: InquiryRecord; locale: Locale; copy: ReturnType<typeof getInquiryPortalCopy> }) {
  const summary = inquiry.items.length
    ? inquiry.items.map((item) => `${item.model} × ${item.quantity}`).join(", ")
    : inquiry.originalModel || inquiry.message.slice(0, 90);

  return (
    <li className="rounded-lg border border-line bg-white p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-ink [overflow-wrap:anywhere]">{inquiry.reference}</p>
          <p className="mt-2 break-words text-sm leading-6 text-steel [overflow-wrap:anywhere]">{summary || copy.unknown}</p>
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-steel">
            <div>
              <dt className="sr-only">{copy.status}</dt>
              <dd className="font-medium text-accent-dark">{getStatusLabel(copy, inquiry.status)}</dd>
            </div>
            <div>
              <dt className="sr-only">{copy.date}</dt>
              <dd>{copy.date}: {formatDate(inquiry.createdAt, locale)}</dd>
            </div>
            <div>
              <dt className="sr-only">{copy.kind}</dt>
              <dd>{copy[inquiry.kind]}</dd>
            </div>
          </dl>
        </div>
        <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href={getLocalizedHref(locale, `/account/inquiries/${inquiry.id}`)}>
          {copy.openInquiry}
        </Link>
      </div>
    </li>
  );
}

export default async function AccountInquiriesPage({ params, searchParams }: InquiriesPageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();

  const locale = localeParam as Locale;
  const copy = getInquiryPortalCopy(locale);
  const page = parsePage((await searchParams)?.page);

  if (!isInquiryPortalEnabled()) {
    return (
      <Container className="py-10 md:py-12">
        <UnavailablePanel locale={locale} copy={copy} />
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
            <a className={buttonVariants({ variant: "accent" })} href={`mailto:${brand.email}`}>
              {copy.email}
            </a>
            <a className={buttonVariants({ variant: "secondary" })} href={brand.whatsapp.href}>
              {copy.whatsapp}
            </a>
          </div>
        </section>
      </Container>
    );
  }
  if (!session) {
    return (
      <Container className="py-10 md:py-12">
        <SignInPanel locale={locale} copy={copy} />
      </Container>
    );
  }

  let data: { items: InquiryRecord[]; total: number };
  let loadFailed = false;
  try {
    data = await session.repository.list(session.user.id, page);
  } catch {
    loadFailed = true;
    data = { items: [], total: 0 };
  }

  const totalPages = Math.max(1, Math.ceil(data.total / pageSize));

  return (
    <Container className="py-10 md:py-12">
      <div className="mb-8 flex flex-col gap-4 border-t border-line pt-7 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-sans text-4xl font-semibold leading-tight text-ink">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">{copy.description}</p>
        </div>
        <Link className={buttonVariants({ variant: "accent" })} href={getLocalizedHref(locale, "/account/inquiries/new")}>
          {copy.newInquiry}
        </Link>
      </div>

      <section className="surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 text-sm text-steel">
          <span>{copy.totalInquiries}: <strong className="text-ink">{data.total}</strong></span>
          <span>{copy.pageLabel}: {page} / {totalPages}</span>
        </div>

        {loadFailed ? (
          <p className="mt-5 rounded-lg bg-red-50 p-4 text-sm leading-6 text-red-700" role="alert">{copy.unavailableRecord}</p>
        ) : data.items.length ? (
          <ul className="mt-5 space-y-3">
            {data.items.map((inquiry) => (
              <InquiryRow key={inquiry.id} inquiry={inquiry} locale={locale} copy={copy} />
            ))}
          </ul>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-line bg-sand p-6 text-sm leading-7 text-steel">
            {copy.empty}
          </div>
        )}

        <nav className="mt-6 flex flex-wrap justify-between gap-3" aria-label={copy.pageLabel}>
          <Link
            className={buttonVariants({ variant: "secondary", size: "sm" })}
            aria-disabled={page <= 1}
            href={getLocalizedHref(locale, `/account/inquiries?page=${Math.max(1, page - 1)}`)}
          >
            {copy.previous}
          </Link>
          <Link
            className={buttonVariants({ variant: "secondary", size: "sm" })}
            aria-disabled={page >= totalPages}
            href={getLocalizedHref(locale, `/account/inquiries?page=${Math.min(totalPages, page + 1)}`)}
          >
            {copy.next}
          </Link>
        </nav>
      </section>
    </Container>
  );
}
