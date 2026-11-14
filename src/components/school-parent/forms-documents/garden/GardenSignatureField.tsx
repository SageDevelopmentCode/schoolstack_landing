"use client";

import { forwardRef, useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Tick } from "@/components/garden/ui";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { G_INPUT, G_LABEL } from "@/components/school-parent/garden/ui";
import { greatVibes } from "@/lib/fonts/great-vibes";

// next/font's own family name: the Garden type reset outranks the font class on <p>.
const SIGNATURE_FONT_FAMILY = `${greatVibes.style.fontFamily}, "Great Vibes", cursive`;

type GardenSignatureFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  /** Shown under the input when the parent tried to sign without a name. */
  invalid?: boolean;
  signedOn?: string | null;
};

/**
 * Garden typed signature: a paper "signature line" with a live script preview
 * above the name input. Enter signs when a name is typed.
 */
const GardenSignatureField = forwardRef<HTMLInputElement, GardenSignatureFieldProps>(
  function GardenSignatureField(
    { value, onChange, onSubmit, disabled = false, readOnly = false, invalid = false, signedOn },
    ref,
  ) {
    const inputId = useId();
    const errorId = useId();
    const reduce = useReducedMotion() === true;
    const trimmed = value.trim();
    const inputDisabled = disabled || readOnly;

    return (
      <div>
        <div
          className={`relative overflow-hidden rounded-[18px] border-[1.5px] px-5 pb-4 pt-5 transition-colors duration-300 ${
            trimmed
              ? "border-[var(--sf-clay)]/45 bg-[var(--sf-accent-wash)]"
              : "border-dashed border-[var(--sf-ink)]/20 bg-[var(--sf-paper)]"
          }`}
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex min-h-[56px] items-end gap-3">
            <span aria-hidden="true" className="sf-display pb-1 text-[1.5rem] leading-none text-[var(--sf-ink)]/35">
              ×
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={trimmed ? "signed" : "empty"}
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: PORTAL_EASE }}
                className={`${greatVibes.className} m-0 min-w-0 flex-1 break-words text-[2rem] leading-tight sm:text-[2.3rem] ${
                  trimmed ? "text-[var(--sf-clay-deep)]" : "text-[var(--sf-ink)]/30"
                }`}
                style={{ fontFamily: SIGNATURE_FONT_FAMILY, letterSpacing: "0.02em" }}
              >
                {trimmed || "Your signature will appear here"}
              </motion.p>
            </AnimatePresence>
            {trimmed && !readOnly ? (
              <span className="mb-1.5 shrink-0" aria-hidden="true">
                <Tick className="h-6 w-6" color="var(--sf-forest)" fill="var(--sf-mint)" />
              </span>
            ) : null}
          </div>
          <div aria-hidden="true" className="mt-1 h-[2px] rounded-full bg-[var(--sf-ink)]/25" />
          {signedOn ? (
            <p className="m-0 mt-2 text-[12px] font-extrabold text-[var(--sf-ink)]/55">Signed on {signedOn}</p>
          ) : null}
        </div>

        {readOnly ? null : (
          <div className="mt-4">
            <label htmlFor={inputId} className={G_LABEL}>
              Type your full legal name to sign
            </label>
            <input
              ref={ref}
              id={inputId}
              type="text"
              value={value}
              autoComplete="name"
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && onSubmit && trimmed && !inputDisabled) {
                  event.preventDefault();
                  onSubmit();
                }
              }}
              disabled={inputDisabled}
              placeholder="Full legal name"
              aria-invalid={invalid && !trimmed ? true : undefined}
              aria-describedby={invalid && !trimmed ? errorId : undefined}
              className={`${G_INPUT} ${invalid && !trimmed ? "!border-[#b42318]/60" : ""}`}
            />
            {invalid && !trimmed ? (
              <p id={errorId} className="m-0 mt-1.5 text-[13px] font-extrabold text-[#b42318]">
                Type your name here to sign.
              </p>
            ) : (
              <p className="m-0 mt-1.5 text-[12px] font-semibold text-[var(--sf-soft)]">
                {trimmed ? "Press Enter or use the button below to sign." : "Your typed name becomes your signature on this form."}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);

export default GardenSignatureField;
