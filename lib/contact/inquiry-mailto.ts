import { brand } from "@/lib/brand";

export function buildInquiryMailto(input: { name: string; email: string; company: string; phone: string; message: string }) {
  const body = [
    input.name && `Name: ${input.name}`,
    input.email && `Email: ${input.email}`,
    input.company && `Company: ${input.company}`,
    input.phone && `Phone: ${input.phone}`,
    input.message,
  ].filter(Boolean).join("\n\n");
  return `mailto:${brand.email}?subject=${encodeURIComponent("EKD product inquiry")}&body=${encodeURIComponent(body)}`;
}
