"use client";

import { Check, Mail } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { mudkitchenDemoContact } from "@/data/school-demos/mudkitchen-demo-contact";

const inputClassName =
  "w-full rounded-md bg-white border border-black/[0.09] px-3 py-2.5 text-sm text-[#2E4A3C] placeholder-[#2E4A3C]/40 font-body outline-none focus:ring-2 focus:ring-[#2E4A3C]/30 focus:border-[#2E4A3C] transition";

export default function DemoContactPanel() {
  const { heading, subheading, contact, form } = mudkitchenDemoContact;
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit =
    question.trim().length > 0 && name.trim().length > 0 && email.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F7F1E7]">
      <div className="mx-auto flex max-w-2xl flex-col px-6 py-10 sm:px-10 sm:py-12">
          <div className="mb-8 flex items-center gap-3">
            <Image
              src="/images/Logo.png"
              alt="MudKitchen"
              width={32}
              height={32}
              className="h-8 w-auto object-contain"
            />
            <h2 className="font-display text-xl font-semibold text-[#2E4A3C] sm:text-2xl">
              {heading}
            </h2>
          </div>

          <p className="mb-8 text-sm leading-relaxed text-[#2E4A3C]/70 font-body">
            {subheading}
          </p>

          {submitted ? (
            <div className="rounded-lg border border-[#2E4A3C]/10 bg-[#F7F1E7] px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2E4A3C] text-white">
                <Check className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="font-display text-lg font-medium text-[#2E4A3C]">
                {form.successTitle}
              </h3>
              <p className="mt-2 text-sm text-[#2E4A3C]/70 font-body">
                {form.successMessage}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-black/[0.07] bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#2E4A3C]/80 font-body">
                    {form.questionLabel}
                  </span>
                  <textarea
                    rows={4}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={form.questionPlaceholder}
                    className={`${inputClassName} resize-none`}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#2E4A3C]/80 font-body">
                    {form.nameLabel}
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={form.namePlaceholder}
                    className={inputClassName}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-[#2E4A3C]/80 font-body">
                    {form.emailLabel}
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={form.emailPlaceholder}
                    className={inputClassName}
                  />
                </label>
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                  className="mt-1 w-full rounded-lg bg-[#2E4A3C] py-2.5 text-sm font-semibold text-white font-body transition-colors hover:bg-[#233B2F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {form.submitLabel}
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 rounded-lg border border-black/[0.07] bg-white px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2E4A3C]/50 font-body">
              Contact us
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#2E4A3C] font-body hover:text-[#233B2F] transition-colors"
            >
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              {contact.email}
            </a>
            <p className="mt-2 text-xs text-[#2E4A3C]/60 font-body">{contact.blurb}</p>
          </div>
      </div>
    </div>
  );
}
