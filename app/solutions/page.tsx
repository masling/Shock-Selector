import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/marketing/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { solutions } from "@/lib/content/site";

export const metadata: Metadata = {
  title: "Solutions",
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

export default function SolutionsPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Solutions"
        title="Start from your application and narrow the right product direction."
        description="Choose the route that best matches what you already know: motion type or drive method."
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {solutions.map((solution, solutionIndex) => (
          <div key={solution.title} className="rounded-[2rem] border border-line bg-white/80 p-7">
            <h2 className="font-display text-2xl font-semibold">{solution.title}</h2>
            <p className="mt-4 text-sm leading-7 text-steel">{solution.description}</p>
            <ul className="mt-6 space-y-3 text-sm text-ink">
              {solution.items.map((item, itemIndex) => (
                <li key={item}>
                  <Link
                    href={solutionItemRoutes[solutionIndex]?.[itemIndex] ?? "/solutions"}
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
        <Link href="/products" className={buttonVariants({ variant: "primary" })}>
          Browse product families
        </Link>
        <Link href="/selector/engineer" className={buttonVariants({ variant: "secondary" })}>
          Start guided sizing
        </Link>
      </div>
    </Container>
  );
}
