"use client";

import { Turnstile } from "@marsidev/react-turnstile";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

interface TurnstileFieldProps {
  onTokenChange: (token: string | null) => void;
}

export function isTurnstileClientConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export default function TurnstileField({ onTokenChange }: TurnstileFieldProps) {
  if (!siteKey) {
    return null;
  }

  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={onTokenChange}
      onExpire={() => onTokenChange(null)}
      onError={() => onTokenChange(null)}
    />
  );
}
