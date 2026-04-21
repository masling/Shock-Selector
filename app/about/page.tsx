import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { companyHighlights } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="About EKD"
        title="Industrial motion protection backed by engineering support."
        description="EKD focuses on industrial shock absorption, vibration control and application guidance for machine builders and industrial operators."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-line bg-white/80 p-8">
          <h2 className="font-display text-2xl font-semibold">Company profile</h2>
          <p className="mt-5 text-sm leading-8 text-steel">
            Jiangsu EKD Machinery Technical Co., Ltd. focuses on vibration control, noise reduction
            and industrial shock absorption products. The current EKD material set emphasizes both
            civil-industrial applications and demanding environments, backed by a team with long industry
            experience and a practical engineering support mindset.
          </p>
          <p className="mt-5 text-sm leading-8 text-steel">
            The team supports model selection, application review and product recommendations for both
            automation equipment and heavy-duty impact-control applications.
          </p>
        </div>

        <div className="space-y-4">
          {companyHighlights.map((item) => (
            <div key={item} className="rounded-[1.75rem] border border-line bg-[#e9ede4] p-6 text-sm leading-7 text-steel">
              {item}
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
