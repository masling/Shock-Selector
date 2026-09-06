import Image from "next/image";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils/cn";

type BrandMarkProps = {
  className?: string;
  priority?: boolean;
};

export function BrandMark({ className, priority = false }: BrandMarkProps) {
  return (
    <span className={cn("relative block aspect-[560/217] h-10 shrink-0 overflow-hidden", className)}>
      <Image
        src={brand.logo}
        alt={brand.name}
        width={1158}
        height={217}
        priority={priority}
        className="absolute inset-y-0 left-0 h-full w-auto max-w-none"
      />
    </span>
  );
}
