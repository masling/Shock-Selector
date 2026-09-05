"use client";

import { useMemo, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { createBrowserAuthClient } from "@/lib/auth/supabase-browser";

type SignInCopy = {
  title: string;
  description: string;
  emailLabel: string;
  emailPlaceholder: string;
  codeLabel: string;
  codePlaceholder: string;
  sendCode: string;
  sendingCode: string;
  verifyCode: string;
  verifyingCode: string;
  codeSent: string;
  google: string;
  unavailableTitle: string;
  unavailableDescription: string;
  emailFallback: string;
  whatsappFallback: string;
  requirement: string;
  error: string;
};

type SignInFormProps = {
  copy: SignInCopy;
  nextPath: string;
  authConfigured: boolean;
  googleEnabled: boolean;
  serviceEmail: string;
  whatsappHref: string;
};

export function SignInForm({
  copy,
  nextPath,
  authConfigured,
  googleEnabled,
  serviceEmail,
  whatsappHref,
}: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const authClient = useMemo(() => createBrowserAuthClient(), []);

  async function handleSendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!authClient) {
      return;
    }

    setIsSendingCode(true);
    setError(null);
    setMessage(null);

    try {
      const { error: signInError } = await authClient.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (signInError) {
        setError(copy.error);
        return;
      }

      setMessage(copy.codeSent);
    } catch {
      setError(copy.error);
    } finally {
      setIsSendingCode(false);
    }
  }

  async function handleVerifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!authClient) {
      return;
    }

    setIsVerifyingCode(true);
    setError(null);

    try {
      const { error: verifyError } = await authClient.auth.verifyOtp({
        email,
        token: token.trim(),
        type: "email",
      });

      if (verifyError) {
        setError(copy.error);
        return;
      }

      window.location.assign(nextPath);
    } catch {
      setError(copy.error);
    } finally {
      setIsVerifyingCode(false);
    }
  }

  async function handleGoogleSignIn() {
    if (!authClient) {
      return;
    }

    setError(null);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
      const { error: googleError } = await authClient.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (googleError) {
        setError(copy.error);
      }
    } catch {
      setError(copy.error);
    }
  }

  if (!authConfigured || !authClient) {
    return (
      <div className="rounded-xl border border-line bg-white p-6">
        <h2 className="text-xl font-semibold text-ink">{copy.unavailableTitle}</h2>
        <p className="mt-3 text-sm leading-7 text-steel">{copy.unavailableDescription}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a className={buttonVariants({ variant: "accent" })} href={`mailto:${serviceEmail}`}>
            {copy.emailFallback}
          </a>
          <a className={buttonVariants({ variant: "secondary" })} href={whatsappHref}>
            {copy.whatsappFallback}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-white p-6">
      <p className="text-sm leading-7 text-steel">{copy.requirement}</p>

      {message ? (
        <div className="mt-5 rounded-lg bg-accent-soft p-4 text-sm text-accent-dark" role="status">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}

      <form className="mt-6 space-y-4" onSubmit={handleSendCode}>
        <label className="block space-y-2 text-sm text-steel">
          <span>{copy.emailLabel}</span>
          <input
            className="field"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={copy.emailPlaceholder}
          />
        </label>
        <Button type="submit" variant="accent" disabled={isSendingCode || !email}>
          {isSendingCode ? copy.sendingCode : copy.sendCode}
        </Button>
      </form>

      <form className="mt-6 space-y-4 border-t border-line pt-6" onSubmit={handleVerifyCode}>
        <label className="block space-y-2 text-sm text-steel">
          <span>{copy.codeLabel}</span>
          <input
            className="field"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder={copy.codePlaceholder}
          />
        </label>
        <Button type="submit" disabled={isVerifyingCode || !email || !token.trim()}>
          {isVerifyingCode ? copy.verifyingCode : copy.verifyCode}
        </Button>
      </form>

      {googleEnabled ? (
        <div className="mt-6 border-t border-line pt-6">
          <button
            type="button"
            className={buttonVariants({ variant: "secondary" })}
            onClick={handleGoogleSignIn}
          >
            {copy.google}
          </button>
        </div>
      ) : null}
    </div>
  );
}
