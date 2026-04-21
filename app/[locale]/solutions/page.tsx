import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/marketing/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getLocalizedHref } from "@/lib/i18n/routing";
import { getSiteCopy } from "@/lib/i18n/site-copy";

type SolutionsPageProps = {
  params: Promise<{ locale: string }>;
};

const solutionItemRoutes = [
  [
    "/selector/engineer?entryKey=linear_free_motion",
    "/selector/engineer?entryKey=linear_motor_driven",
    "/selector/engineer?entryKey=linear_cylinder_driven",
    "/selector/engineer?entryKey=rotary_motion",
  ],
  [
    "/selector/engineer?entryKey=linear_free_motion",
    "/selector/engineer?entryKey=linear_force_driven",
    "/selector/engineer?entryKey=linear_motor_driven",
    "/selector/engineer?entryKey=linear_cylinder_driven",
  ],
] as const;

export async function generateMetadata({ params }: SolutionsPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const copy = getSiteCopy(localeParam);
  return { title: copy.metadata.solutionsTitle };
}

export default async function SolutionsPage({ params }: SolutionsPageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const copy = getSiteCopy(locale);

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow={copy.solutions.eyebrow}
        title={copy.solutions.title}
        description={copy.solutions.description}
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {copy.solutions.items.map((solution, solutionIndex) => (
          <div key={solution.title} className="rounded-[2rem] border border-line bg-white/80 p-7">
            <h2 className="font-display text-2xl font-semibold">{solution.title}</h2>
            <p className="mt-4 text-sm leading-7 text-steel">{solution.description}</p>
            <ul className="mt-6 space-y-3 text-sm text-ink">
              {solution.items.map((item, itemIndex) => (
                <li key={item}>
                  <Link
                    href={getLocalizedHref(locale, solutionItemRoutes[solutionIndex]?.[itemIndex] ?? "/solutions")}
                    className="inline-flex hover:text-accent-dark hover:underline"
                  >
                    • {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href={getLocalizedHref(locale, "/products")} className={buttonVariants({ variant: "primary" })}>
          {copy.solutions.primaryCta}
        </Link>
        <Link
          href={getLocalizedHref(locale, "/selector/engineer")}
          className={buttonVariants({ variant: "secondary" })}
        >
          {copy.solutions.secondaryCta}
        </Link>
      </div>
    </Container>
  );
}
