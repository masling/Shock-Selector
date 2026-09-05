import { cn } from "@/lib/utils/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: Heading = "h1",
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl space-y-4", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <p className="text-sm font-medium text-accent">{eyebrow}</p> : null}
      <div className="space-y-3">
        <Heading className="text-3xl font-semibold leading-tight tracking-tight text-ink [overflow-wrap:anywhere] md:text-[2.65rem] md:leading-[1.2]">
          {title}
        </Heading>
        {description ? (
          <p className="max-w-2xl text-base leading-7 text-steel">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
