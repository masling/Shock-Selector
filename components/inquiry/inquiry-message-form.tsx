"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import type { InquiryPortalCopy } from "@/lib/i18n/inquiry-portal-copy";

type InquiryMessageFormProps = {
  inquiryId: string;
  locale: Locale;
  copy: InquiryPortalCopy;
  disabled?: boolean;
};

const messageKeyPrefix = "ekd-inquiry-message-key:v1:";

function newSubmissionKey() {
  const browserCrypto = globalThis.crypto;

  if (browserCrypto?.randomUUID) {
    return browserCrypto.randomUUID();
  }

  if (browserCrypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    browserCrypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, "0").slice(-12)}`;
}

export function InquiryMessageForm({ inquiryId, copy, disabled = false }: InquiryMessageFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [submissionKey, setSubmissionKey] = useState(newSubmissionKey);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const storageKey = `${messageKeyPrefix}${inquiryId}`;

  useEffect(() => {
    try {
      const storedKey = window.sessionStorage.getItem(storageKey);
      if (storedKey) setSubmissionKey(storedKey);
      else window.sessionStorage.setItem(storageKey, submissionKey);
    } catch {
      // Idempotency storage is best-effort; the current in-memory key remains stable for this mount.
    }
  }, [storageKey, submissionKey]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim() || disabled) return;

    setStatus("saving");
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ submissionKey, body }),
      });

      if (!response.ok) {
        setStatus("failed");
        return;
      }

      const nextKey = newSubmissionKey();
      setBody("");
      setSubmissionKey(nextKey);
      setStatus("saved");
      try {
        window.sessionStorage.setItem(storageKey, nextKey);
      } catch {
        // Message was persisted; rotating local idempotency storage is best-effort.
      }
      router.refresh();
    } catch {
      setStatus("failed");
    }
  }

  return (
    <form className="surface p-5" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-ink">{copy.addMessage}</h2>
      {disabled ? (
        <p className="mt-3 rounded-lg bg-sand p-4 text-sm leading-6 text-steel">{copy.closedMessage}</p>
      ) : (
        <>
          <label className="mt-4 block">
            <span className="sr-only">{copy.addMessage}</span>
            <textarea
              className="field min-h-28"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={copy.messagePlaceholderShort}
              required
            />
          </label>
          {status === "saved" ? <p className="mt-3 text-sm text-accent-dark" role="status">{copy.messageSaved}</p> : null}
          {status === "failed" ? <p className="mt-3 text-sm text-red-700" role="alert">{copy.messageFailure}</p> : null}
          <div className="mt-4">
            <Button type="submit" variant="accent" disabled={status === "saving" || !body.trim()}>
              {status === "saving" ? copy.sendingMessage : copy.sendMessage}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
