import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InquiryRequestForm } from "@/components/inquiry/inquiry-request-form";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { brand } from "@/lib/brand";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getInquiryPortalCopy } from "@/lib/i18n/inquiry-portal-copy";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { getInquirySession, isInquiryPortalEnabled } from "@/lib/inquiry/inquiry-service";
import type { CreateInquiryInput } from "@/lib/inquiry/schemas";

type NewInquiryPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type InquiryKind = CreateInquiryInput["kind"];

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseModels(value: string | string[] | undefined) {
  return Array.from(new Set((firstValue(value) ?? "").split(",").map((model) => model.trim()).filter(Boolean))).slice(0, 50);
}

function parseKind(request: string | string[] | undefined, models: string[]): InquiryKind | undefined {
  const value = firstValue(request);
  if (value === "replacement" || value === "project") return value;
  return models.length ? "standard" : undefined;
}

export default async function NewInquiryPage({ params, searchParams }: NewInquiryPageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();

  const locale = localeParam as Locale;
  const copy = getInquiryPortalCopy(locale);
  const query = (await searchParams) ?? {};
  const initialModels = parseModels(query.models);
  const initialKind = parseKind(query.request, initialModels);
  const portalEnabled = isInquiryPortalEnabled();
  let signedIn = false;
  let authReachable = true;
  try {
    signedIn = Boolean(await getInquirySession());
  } catch {
    authReachable = false;
  }

  return (
    <Container className="py-10 md:py-12">
      <div className="mb-8 flex flex-col gap-4 border-t border-line pt-7 md:flex-row md:items-end md:justify-between">
        <div>
          <Link className="text-sm font-semibold text-accent-dark" href={getLocalizedHref(locale, "/account/inquiries")}>
            {copy.history}
          </Link>
          <h1 className="mt-4 max-w-3xl font-sans text-4xl font-semibold leading-tight text-ink">{copy.newTitle}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">{copy.intro}</p>
        </div>
        <Link className={buttonVariants({ variant: "secondary" })} href={getLocalizedHref(locale, "/inquiry")}>
          {copy.draft}
        </Link>
      </div>

      <InquiryRequestForm
        locale={locale}
        copy={copy}
        signedIn={signedIn}
        portalEnabled={portalEnabled && authReachable}
        serviceEmail={brand.email}
        whatsappHref={brand.whatsapp.href}
        initialModels={initialModels}
        initialKind={initialKind}
      />
    </Container>
  );
}
