import { z } from "zod";
import { locales } from "@/lib/i18n/config";

export const ContactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email format").max(200),
  company: z.string().max(200).optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  message: z.string().min(1, "Message is required").max(2000),
  locale: z.enum(locales),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;
