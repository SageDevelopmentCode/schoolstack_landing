"use client";

import { useId } from "react";

/**
 * Spam trap for lead forms. Same idea as PublicFormHoneypotField, but with a unique id, so
 * several forms can sit on one page (the home section, the popup and the booking form).
 */
export default function LeadHoneypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const id = `${useId()}-company-website`;
  return (
    <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
      <label htmlFor={id}>Company website</label>
      <input
        id={id}
        name="companyWebsite"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
