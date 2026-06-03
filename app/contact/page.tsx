import type { Metadata } from "next";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact EKD for Shock Absorber Selection Support",
};

const directChannels = [
  { label: "General email", value: "office@ekdchina.com", href: "mailto:office@ekdchina.com" },
  { label: "Technical support", value: "tech@ekdchina.com", href: "mailto:tech@ekdchina.com" },
  { label: "Sales", value: "sales1@ekdchina.com", href: "mailto:sales1@ekdchina.com" },
  { label: "Service", value: "service@ekdchina.com", href: "mailto:service@ekdchina.com" },
  { label: "Phone", value: "+86 510 82801575", href: "tel:+8651082801575" },
];

const socialChannels = [
  { label: "WhatsApp", value: "Official number to be confirmed" },
  { label: "LinkedIn", value: "Official page to be confirmed" },
  { label: "X", value: "Official account to be confirmed" },
  { label: "YouTube", value: "Official channel to be confirmed" },
];

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
          {directChannels.map((channel) => (
            <ContactChannelCard key={channel.label} channel={channel} />
          ))}

          <div className="rounded-[1.75rem] border border-line bg-white/75 p-6">
            <div className="text-xs uppercase tracking-[0.16em] text-steel">
              Overseas contact channels
            </div>
            <p className="mt-3 text-sm leading-7 text-steel">
              International buyers often expect quick access through social and messaging channels.
              Official account links can be added here once confirmed.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {socialChannels.map((channel) => (
                <ContactChannelCard key={channel.label} channel={channel} compact />
              ))}
            </div>
          </div>
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

function ContactChannelCard({
  channel,
  compact = false,
}: {
  channel: { label: string; value: string; href?: string };
  compact?: boolean;
}) {
  const content = (
    <>
      <div className="text-xs uppercase tracking-[0.16em] text-steel">{channel.label}</div>
      <div className={compact ? "mt-2 text-sm font-medium leading-6" : "mt-2 text-lg font-medium"}>
        {channel.value}
      </div>
    </>
  );

  const className = compact
    ? "block rounded-2xl border border-line bg-white p-4 transition hover:border-accent/40"
    : "block rounded-[1.75rem] border border-line bg-white/75 p-6 transition hover:border-accent/40";

  if (channel.href) {
    return (
      <a className={className} href={channel.href}>
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}
