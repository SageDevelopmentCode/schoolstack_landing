"use client";

import { PUBLIC_FORM_HONEYPOT_FIELD } from "@/lib/public-forms/honeypot";

type PublicFormHoneypotFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function PublicFormHoneypotField({
  value,
  onChange,
}: PublicFormHoneypotFieldProps) {
  return (
    <div
      className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
      aria-hidden="true"
    >
      <label htmlFor={PUBLIC_FORM_HONEYPOT_FIELD}>Company website</label>
      <input
        id={PUBLIC_FORM_HONEYPOT_FIELD}
        name={PUBLIC_FORM_HONEYPOT_FIELD}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
