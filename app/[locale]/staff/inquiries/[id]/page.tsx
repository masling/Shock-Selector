import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StaffInquiryActions } from "@/components/inquiry-staff/staff-inquiry-actions";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { getStaffInquirySession } from "@/lib/inquiry-staff/staff-repository";
import type { StaffInquiryDetail, StaffStatus } from "@/lib/inquiry-staff/schemas";

type StaffInquiryDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Staff inquiry detail | EKD",
  robots: { index: false, follow: false },
};

const statusLabels: Record<StaffStatus, string> = {
  received: "Received",
  reviewing: "Under review",
  awaiting_customer: "Awaiting customer",
  quoted: "Quoted",
  closed: "Closed",
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function StaffUnavailable({ locale, title, description }: { locale: Locale; title: string; description: string }) {
  return (
    <Container className="py-10 md:py-12">
      <section className="surface p-6">
        <h1 className="text-2xl font-semibold text-ink">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">{description}</p>
        <div className="mt-6">
          <Link className={buttonVariants({ variant: "accent" })} href={getLocalizedHref(locale, `/sign-in?next=${encodeURIComponent(`/${locale}/staff/inquiries`)}`)}>
            Verify staff email
          </Link>
        </div>
      </section>
    </Container>
  );
}

function Summary({ detail, locale }: { detail: StaffInquiryDetail; locale: Locale }) {
  const inquiry = detail.inquiry;
  return (
    <section className="surface p-5">
      <h2 className="text-lg font-semibold text-ink">Inquiry summary</h2>
      <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-steel">Reference</dt>
          <dd className="mt-1 break-words font-semibold text-ink [overflow-wrap:anywhere]">{inquiry.reference}</dd>
        </div>
        <div>
          <dt className="text-steel">Status</dt>
          <dd className="mt-1 font-semibold text-accent-dark">{statusLabels[inquiry.status as StaffStatus] ?? inquiry.status}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-steel">Customer</dt>
          <dd className="mt-1 break-words text-ink [overflow-wrap:anywhere]">{inquiry.contactName} · {inquiry.email}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-steel">Company / country</dt>
          <dd className="mt-1 break-words text-ink [overflow-wrap:anywhere]">{inquiry.company || "—"} · {inquiry.country}</dd>
        </div>
        <div>
          <dt className="text-steel">Submitted</dt>
          <dd className="mt-1 text-ink">{formatDate(inquiry.createdAt, locale)}</dd>
        </div>
        <div>
          <dt className="text-steel">Assigned</dt>
          <dd className="mt-1 text-ink">{detail.assignment ? "Assigned" : "Unassigned"}</dd>
        </div>
      </dl>
      {inquiry.originalModel ? (
        <div className="mt-4 rounded-lg bg-sand p-4 text-sm">
          <p className="font-medium text-ink">Original model</p>
          <p className="mt-2 break-words leading-6 text-steel [overflow-wrap:anywhere]">{inquiry.originalModel}</p>
        </div>
      ) : null}
      <div className="mt-4 rounded-lg bg-sand p-4 text-sm">
        <p className="font-medium text-ink">Customer requirements</p>
        <p className="mt-2 whitespace-pre-wrap break-words leading-7 text-steel [overflow-wrap:anywhere]">{inquiry.message}</p>
      </div>
    </section>
  );
}

function ProductRows({ detail }: { detail: StaffInquiryDetail }) {
  if (!detail.inquiry.items.length) return null;
  return (
    <section className="surface p-5">
      <h2 className="text-lg font-semibold text-ink">Products</h2>
      <div className="scroll-table mt-4">
        <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
          <thead className="text-xs text-steel">
            <tr>
              <th className="pb-2 pr-4 font-medium">Model</th>
              <th className="pb-2 pr-4 font-medium">Qty</th>
              <th className="pb-2 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {detail.inquiry.items.map((item) => (
              <tr key={item.model} className="bg-sand">
                <td className="rounded-l-lg break-words px-3 py-3 font-semibold text-ink [overflow-wrap:anywhere]">{item.model}</td>
                <td className="px-3 py-3 text-ink">{item.quantity}</td>
                <td className="rounded-r-lg break-words px-3 py-3 text-steel [overflow-wrap:anywhere]">{item.note || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Thread({ detail, locale }: { detail: StaffInquiryDetail; locale: Locale }) {
  return (
    <section className="surface p-5">
      <h2 className="text-lg font-semibold text-ink">Customer-visible thread</h2>
      <p className="mt-1 text-sm leading-6 text-steel">Only public replies appear here and in the customer account page. Showing up to the latest 100 messages.</p>
      {detail.messages.length ? (
        <ol className="mt-5 space-y-4">
          {detail.messages.map((message) => (
            <li key={message.id} className="rounded-lg border border-line bg-white p-4">
              <div className="flex flex-wrap justify-between gap-3 text-xs text-steel">
                <span className="font-semibold text-ink">{message.authorRole === "staff" ? "Staff" : "Customer"}</span>
                <time dateTime={message.createdAt}>{formatDate(message.createdAt, locale)}</time>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-steel [overflow-wrap:anywhere]">{message.body}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-line bg-sand p-4 text-sm text-steel">No public messages yet.</p>
      )}
    </section>
  );
}

function InternalNotes({ detail, locale }: { detail: StaffInquiryDetail; locale: Locale }) {
  return (
    <section className="surface p-5">
      <h2 className="text-lg font-semibold text-ink">Internal notes</h2>
      <p className="mt-1 text-sm leading-6 text-steel">Private staff-only notes. Customers cannot read these rows. Showing up to the latest 100 notes.</p>
      {detail.internalNotes.length ? (
        <ol className="mt-5 space-y-4">
          {detail.internalNotes.map((note) => (
            <li key={note.id} className="rounded-lg bg-sand p-4">
              <time className="text-xs text-steel" dateTime={note.createdAt}>{formatDate(note.createdAt, locale)}</time>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-steel [overflow-wrap:anywhere]">{note.body}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 rounded-lg border border-dashed border-line bg-sand p-4 text-sm text-steel">No internal notes yet.</p>
      )}
    </section>
  );
}

function QuoteStatus({ detail }: { detail: StaffInquiryDetail }) {
  if (!detail.quoteDraft && !detail.publishedQuote) return null;
  return (
    <section className="surface p-5">
      <h2 className="text-lg font-semibold text-ink">Quote draft</h2>
      {detail.quoteDraft ? (
        <>
          <p className="mt-2 text-sm text-steel">Status: <span className="font-semibold text-ink">{detail.quoteDraft.status}</span></p>
          <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-sand p-4 text-xs text-ink">{JSON.stringify(detail.quoteDraft.payload, null, 2)}</pre>
        </>
      ) : null}
      {detail.publishedQuote ? (
        <p className="mt-3 text-sm text-accent-dark">A customer-visible quote snapshot has been published.</p>
      ) : null}
    </section>
  );
}

export default async function StaffInquiryDetailPage({ params }: StaffInquiryDetailPageProps) {
  const { locale: localeParam, id } = await params;
  if (!isLocale(localeParam) || !isUuid(id)) notFound();

  const locale = localeParam as Locale;
  let session: Awaited<ReturnType<typeof getStaffInquirySession>>;
  try {
    session = await getStaffInquirySession();
  } catch {
    return <StaffUnavailable locale={locale} title="Staff workbench unavailable" description="Staff authentication or database membership lookup is currently unavailable." />;
  }
  if (!session) {
    return <StaffUnavailable locale={locale} title="Staff access required" description="Sign in with a verified account that has an active staff membership. Customer accounts are not staff by default." />;
  }

  let detail: StaffInquiryDetail;
  try {
    detail = await session.repository.detail(id);
  } catch {
    notFound();
  }

  return (
    <Container className="py-10 md:py-12">
      <div className="mb-8 flex flex-col gap-4 border-t border-line pt-7 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <Link className="text-sm font-semibold text-accent-dark" href={getLocalizedHref(locale, "/staff/inquiries")}>
            Back to staff queue
          </Link>
          <h1 className="mt-4 break-words font-sans text-4xl font-semibold leading-tight text-ink [overflow-wrap:anywhere]">{detail.inquiry.reference}</h1>
          <p className="mt-3 text-sm leading-7 text-steel">Public replies and internal notes are intentionally separate.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.55fr)] lg:items-start">
        <div className="min-w-0 space-y-6">
          <Summary detail={detail} locale={locale} />
          <ProductRows detail={detail} />
          <Thread detail={detail} locale={locale} />
          <InternalNotes detail={detail} locale={locale} />
          <QuoteStatus detail={detail} />
        </div>
        <StaffInquiryActions inquiryId={detail.inquiry.id} currentStatus={detail.inquiry.status as StaffStatus} staffRole={detail.staffRole} quoteDraft={detail.quoteDraft} />
      </div>
    </Container>
  );
}
