import type { Metadata } from "next";
import { Download } from "lucide-react";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { isLocale } from "@/lib/i18n/config";
import { getSiteCopy } from "@/lib/i18n/site-copy";

type DownloadsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: DownloadsPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const copy = getSiteCopy(localeParam);
  return { title: copy.metadata.downloadsTitle };
}

export default async function DownloadsPage({ params }: DownloadsPageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const copy = getSiteCopy(localeParam);

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow={copy.downloads.eyebrow}
        title={copy.downloads.title}
        description={copy.downloads.description}
      />
      <div className="mt-12 grid gap-5">
        {copy.downloads.items.map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-4 rounded-[2rem] border border-line bg-white/80 p-7 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h2 className="font-display text-2xl font-semibold">{item.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">
                {item.description}
              </p>
            </div>
            <a
              href={item.path}
              className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-3 text-sm font-medium text-ink hover:bg-ink hover:text-white"
            >
              <Download className="h-4 w-4" />
              {copy.downloads.action}
            </a>
          </div>
        ))}
      </div>
    </Container>
  );
}
