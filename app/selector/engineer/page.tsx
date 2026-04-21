import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { EngineerSizingClient } from "@/components/selector/engineer-sizing-client";
import { Container } from "@/components/ui/container";
import { getSiteCopy } from "@/lib/i18n/site-copy";
import { getScenarioCatalog } from "@/lib/scenarios/registry";

export const metadata: Metadata = {
  title: "Engineer Sizing",
};

export default function EngineerSizingPage() {
  const copy = getSiteCopy("en");
  const scenarioCatalog = getScenarioCatalog();

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow={copy.engineer.eyebrow}
        title={copy.engineer.title}
        description={copy.engineer.description}
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[2rem] border border-line bg-[#e9ede4] p-8">
          <h2 className="font-display text-2xl font-semibold">{copy.engineer.motionGroupsTitle}</h2>
          <ul className="mt-6 space-y-3 text-sm leading-7 text-steel">
            {scenarioCatalog.entries.map((entry) => (
              <li key={entry.key}>
                • {entry.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <div className="rounded-[2rem] border border-line bg-white/80 p-8">
            <h2 className="font-display text-2xl font-semibold">{copy.engineer.howItWorksTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-steel">
              {copy.engineer.howItWorksDescription}
            </p>
          </div>
          <div className="rounded-[2rem] border border-line bg-white/80 p-8">
            <h2 className="font-display text-2xl font-semibold">{copy.engineer.whatYouGetTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-steel">
              {copy.engineer.whatYouGetDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <EngineerSizingClient locale="en" copy={copy.engineer} />
      </div>
    </Container>
  );
}
