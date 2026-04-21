import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Contact"
        title="Talk with EKD about your machine, motion case or shortlist."
        description="Share the application and required performance range, and we will help confirm the suitable family or model range."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          {[
            ["General email", "office@ekdchina.com"],
            ["Technical support", "tech@ekdchina.com"],
            ["Sales", "sales1@ekdchina.com"],
            ["Service", "service@ekdchina.com"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[1.75rem] border border-line bg-white/75 p-6">
              <div className="text-xs uppercase tracking-[0.16em] text-steel">{label}</div>
              <div className="mt-2 text-lg font-medium">{value}</div>
            </div>
          ))}
        </div>

        <form className="rounded-[2rem] border border-line bg-[#e9ede4] p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm text-steel">
              <span>Name</span>
              <input className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-ink outline-none" />
            </label>
            <label className="space-y-2 text-sm text-steel">
              <span>Company</span>
              <input className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-ink outline-none" />
            </label>
            <label className="space-y-2 text-sm text-steel md:col-span-2">
              <span>Email</span>
              <input className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-ink outline-none" />
            </label>
            <label className="space-y-2 text-sm text-steel md:col-span-2">
              <span>Project brief</span>
              <textarea
                className="min-h-36 w-full rounded-3xl border border-line bg-white px-4 py-3 text-ink outline-none"
                placeholder="Tell us the motion scenario, expected energy, force range or model family you are evaluating."
              />
            </label>
          </div>
          <Button className="mt-6" type="submit" variant="accent">
            Send inquiry
          </Button>
        </form>
      </div>
    </Container>
  );
}
