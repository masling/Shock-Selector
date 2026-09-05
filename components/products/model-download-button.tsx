"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";

type Props = { id: string; format: string; locale: Locale; preparing: string; failure: string };

export function ModelDownloadButton({ id, format, locale, preparing, failure }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function startDownload() {
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      const response = await fetch(`/api/downloads/${encodeURIComponent(id)}`, { method: "POST" });
      if (response.status === 401) {
        window.location.assign(`/${locale}/sign-in`);
        return;
      }
      const result = await response.json() as { url?: string };
      if (!response.ok || !result.url) throw new Error("download unavailable");
      window.location.assign(result.url);
    } catch {
      setError(true);
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <Button type="button" variant="secondary" size="sm" disabled={busy} aria-busy={busy} onClick={startDownload}>
        <Download className="h-4 w-4" aria-hidden="true" />{busy ? preparing : format}
      </Button>
      {error ? <span className="max-w-40 text-xs leading-5 text-red-700" role="alert">{failure}</span> : null}
    </span>
  );
}
