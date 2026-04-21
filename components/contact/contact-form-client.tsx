"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import { ContactFormSchema, type ContactFormData } from "@/lib/contact/schemas";
import type { SiteCopy } from "@/lib/i18n/site-copy";

type ContactFormClientProps = {
  locale: Locale;
  copy: SiteCopy["contact"]["form"];
};

export function ContactFormClient({ locale, copy }: ContactFormClientProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<"success" | "error" | "rateLimit" | null>(null);

  function handleChange(field: string, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setSubmitResult(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    setSubmitResult(null);

    const payload: ContactFormData = {
      ...formData,
      locale,
    };

    const validation = ContactFormSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0]?.toString();
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        setSubmitResult("rateLimit");
        return;
      }

      if (!response.ok) {
        setSubmitResult("error");
        return;
      }

      setSubmitResult("success");
      setFormData({ name: "", email: "", company: "", phone: "", message: "" });
    } catch {
      setSubmitResult("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submitResult === "success" && (
        <div className="rounded-xl bg-accent-soft p-4 text-sm text-accent-dark">
          <p className="font-medium">{copy.successTitle}</p>
          <p className="mt-1">{copy.successMessage}</p>
        </div>
      )}
      {submitResult === "error" && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">{copy.errorTitle}</p>
          <p className="mt-1">{copy.errorMessage}</p>
        </div>
      )}
      {submitResult === "rateLimit" && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {copy.rateLimitMessage}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm text-steel">
          <span>{copy.name} *</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder={copy.namePlaceholder}
            className="w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none focus:border-accent/40"
          />
          {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
        </label>

        <label className="space-y-2 text-sm text-steel">
          <span>{copy.email} *</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder={copy.emailPlaceholder}
            className="w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none focus:border-accent/40"
          />
          {errors.email && <span className="text-xs text-red-600">{errors.email}</span>}
        </label>

        <label className="space-y-2 text-sm text-steel">
          <span>{copy.company}</span>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={(e) => handleChange("company", e.target.value)}
            placeholder={copy.companyPlaceholder}
            className="w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none focus:border-accent/40"
          />
        </label>

        <label className="space-y-2 text-sm text-steel">
          <span>{copy.phone}</span>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder={copy.phonePlaceholder}
            className="w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none focus:border-accent/40"
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm text-steel">
        <span>{copy.brief} *</span>
        <textarea
          name="message"
          value={formData.message}
          onChange={(e) => handleChange("message", e.target.value)}
          placeholder={copy.placeholder}
          rows={5}
          className="w-full rounded-2xl border border-line bg-sand px-4 py-3 text-ink outline-none focus:border-accent/40"
        />
        {errors.message && <span className="text-xs text-red-600">{errors.message}</span>}
      </label>

      <Button type="submit" variant="accent" disabled={isSubmitting}>
        {isSubmitting ? copy.submitting : copy.submit}
      </Button>
    </form>
  );
}
