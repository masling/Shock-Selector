import type { Metadata } from "next";
import { Download } from "lucide-react";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { downloads } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Downloads",
};

export default function DownloadsPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Downloads"
        title="Catalogs and technical references."
        description="Download the main product literature for faster review with your team."
      />
      <div className="mt-12 grid gap-5">
        {downloads.map((item) => (
          <div key={item.title} className="flex flex-col gap-4 rounded-[2rem] border border-line bg-white/80 p-7 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold">{item.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-steel">{item.description}</p>
            </div>
            <a
              href={item.path}
              className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-3 text-sm font-medium text-ink hover:bg-ink hover:text-white"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
          </div>
        ))}
      </div>
    </Container>
  );
}
