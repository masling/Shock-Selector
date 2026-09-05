import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { getStaffInquirySession } from "@/lib/inquiry-staff/staff-repository";
import { staffStatusSchema, type StaffInquiryList, type StaffListItem, type StaffStatus } from "@/lib/inquiry-staff/schemas";

type StaffInquiriesPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Staff inquiries | EKD",
  robots: { index: false, follow: false },
};

const pageSize = 20;
const statusLabels: Record<StaffStatus, string> = {
  received: "Received",
  reviewing: "Under review",
  awaiting_customer: "Awaiting customer",
  quoted: "Quoted",
  closed: "Closed",
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | string[] | undefined) {
  const page = Number(firstValue(value) ?? 1);
  return Number.isInteger(page) && page > 0 && page <= 10000 ? page : 1;
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
          <Link
            className={buttonVariants({ variant: "accent" })}
            href={getLocalizedHref(locale, `/sign-in?next=${encodeURIComponent(`/${locale}/staff/inquiries`)}`)}
          >
            Verify staff email
          </Link>
        </div>
      </section>
    </Container>
  );
}

function InquiryCard({ inquiry, locale }: { inquiry: StaffListItem; locale: Locale }) {
  const summary = inquiry.items.length
    ? inquiry.items.map((item) => `${item.model} × ${item.quantity}`).join(", ")
    : inquiry.originalModel || inquiry.company || inquiry.contactName;

  return (
    <li className="rounded-lg border border-line bg-white p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="break-words text-sm font-semibold text-ink [overflow-wrap:anywhere]">{inquiry.reference}</p>
            <span className="rounded-md bg-accent-soft px-2 py-1 text-xs font-medium text-accent-dark">{statusLabels[inquiry.status as StaffStatus] ?? inquiry.status}</span>
          </div>
          <p className="mt-2 break-words text-sm leading-6 text-steel [overflow-wrap:anywhere]">{summary}</p>
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-steel">
            <div>
              <dt className="sr-only">Customer</dt>
              <dd className="break-words [overflow-wrap:anywhere]">{inquiry.contactName} · {inquiry.email}</dd>
            </div>
            <div>
              <dt className="sr-only">Submitted</dt>
              <dd>{formatDate(inquiry.createdAt, locale)}</dd>
            </div>
            <div>
              <dt className="sr-only">Assignment</dt>
              <dd>{inquiry.assignedTo ? "Assigned" : "Unassigned"}</dd>
            </div>
          </dl>
        </div>
        <Link className={buttonVariants({ variant: "secondary", size: "sm" })} href={getLocalizedHref(locale, `/staff/inquiries/${inquiry.id}`)}>
          Open
        </Link>
      </div>
    </li>
  );
}

export default async function StaffInquiriesPage({ params, searchParams }: StaffInquiriesPageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();

  const locale = localeParam as Locale;
  const query = (await searchParams) ?? {};
  const page = parsePage(query.page);
  const parsedStatus = staffStatusSchema.safeParse(firstValue(query.status));

  let session: Awaited<ReturnType<typeof getStaffInquirySession>>;
  try {
    session = await getStaffInquirySession();
  } catch {
    return <StaffUnavailable locale={locale} title="Staff workbench unavailable" description="Staff authentication or database membership lookup is currently unavailable." />;
  }

  if (!session) {
    return <StaffUnavailable locale={locale} title="Staff access required" description="Sign in with a verified account that has an active staff membership. Customer accounts are not staff by default." />;
  }

  let data: StaffInquiryList;
  let loadFailed = false;
  try {
    data = await session.repository.list(page, parsedStatus.success ? parsedStatus.data : undefined);
  } catch {
    loadFailed = true;
    data = { items: [], total: 0, page, staffRole: session.role };
  }

  const totalPages = Math.max(1, Math.ceil(data.total / pageSize));

  return (
    <Container className="py-10 md:py-12">
      <div className="mb-8 flex flex-col gap-4 border-t border-line pt-7 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-accent-dark">Internal workbench · {data.staffRole}</p>
          <h1 className="mt-3 font-sans text-4xl font-semibold leading-tight text-ink">Customer inquiries</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">Review requirements, assign ownership, reply publicly, and keep private staff notes separate.</p>
        </div>
        <Link className={buttonVariants({ variant: "secondary" })} href={getLocalizedHref(locale, "/account/inquiries")}>
          Customer view
        </Link>
      </div>

      <section className="surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 text-sm text-steel">
          <span>Total: <strong className="text-ink">{data.total}</strong></span>
          <span>Page {page} / {totalPages}</span>
        </div>

        {loadFailed ? (
          <p className="mt-5 rounded-lg bg-red-50 p-4 text-sm leading-6 text-red-700" role="alert">Inquiry records could not be loaded.</p>
        ) : data.items.length ? (
          <ul className="mt-5 space-y-3">
            {data.items.map((inquiry) => <InquiryCard key={inquiry.id} inquiry={inquiry} locale={locale} />)}
          </ul>
        ) : (
          <p className="mt-5 rounded-lg border border-dashed border-line bg-sand p-6 text-sm leading-7 text-steel">No inquiries match this queue.</p>
        )}
      </section>
    </Container>
  );
}
