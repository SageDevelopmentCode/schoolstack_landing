"use client";

import { useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import AdminDisplayHeading from "@/components/school-admin/ui/story/AdminDisplayHeading";
import AdminSectionKicker from "@/components/school-admin/ui/story/AdminSectionKicker";
import { useIsGardenCommittee } from "@/components/school-admin/committees/committee-surface";
import { PORTAL_EASE } from "@/components/school-parent/garden/motion";
import { GKicker, G_FOCUS } from "@/components/school-parent/garden/ui";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type CommitteeFormSidePanelProps = {
  open: boolean;
  theme: ParentThemeTokens;
  kicker: string;
  title: string;
  icon?: ReactNode;
  onRequestClose: () => void;
  saving?: boolean;
  formId?: string;
  onSubmit?: (event: FormEvent) => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function CommitteeFormSection({
  theme,
  title,
  children,
}: {
  theme: ParentThemeTokens;
  title: string;
  children: ReactNode;
}) {
  const garden = useIsGardenCommittee();
  if (garden) {
    return (
      <section className="space-y-3 rounded-[18px] border-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] p-4">
        <h3 className="m-0 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">{title}</h3>
        <div className="space-y-3">{children}</div>
      </section>
    );
  }
  return (
    <section
      className="space-y-3 rounded-lg border p-4"
      style={{ borderColor: theme.line, backgroundColor: theme.white }}
    >
      <h3
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: theme.muted }}
      >
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function CommitteeFormSidePanel({
  open,
  theme,
  kicker,
  title,
  icon,
  onRequestClose,
  saving = false,
  formId,
  onSubmit,
  children,
  footer,
}: CommitteeFormSidePanelProps) {
  const garden = useIsGardenCommittee();
  if (garden) {
    return (
      <GardenFormSidePanel
        open={open}
        kicker={kicker}
        title={title}
        icon={icon}
        onRequestClose={onRequestClose}
        saving={saving}
        formId={formId}
        onSubmit={onSubmit}
        footer={footer}
      >
        {children}
      </GardenFormSidePanel>
    );
  }
  const body = (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">{children}</div>
      {footer ? (
        <div
          className="shrink-0 border-t px-6 py-4"
          style={{ borderColor: theme.line, backgroundColor: theme.paper }}
        >
          {footer}
        </div>
      ) : null}
    </>
  );

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.15)" }}
            onClick={onRequestClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex w-[min(100%,24rem)] flex-col overflow-hidden border-l shadow-xl sm:w-[400px]"
            style={{ backgroundColor: theme.white, borderColor: theme.line }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b px-6 py-5"
              style={{ borderColor: theme.line, backgroundColor: theme.white }}
            >
              <div className="flex min-w-0 items-start gap-3 pr-2">
                {icon ? (
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: theme.primarySoft }}
                  >
                    {icon}
                  </div>
                ) : null}
                <div className="min-w-0">
                  <AdminSectionKicker theme={theme}>{kicker}</AdminSectionKicker>
                  <AdminDisplayHeading
                    theme={theme}
                    as="h2"
                    size="section"
                    className="mt-1 truncate"
                  >
                    {title}
                  </AdminDisplayHeading>
                </div>
              </div>
              <button
                type="button"
                onClick={onRequestClose}
                disabled={saving}
                className="shrink-0 rounded-md p-1.5 transition-colors disabled:opacity-50"
                style={{ color: theme.muted }}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formId && onSubmit ? (
              <form
                id={formId}
                onSubmit={onSubmit}
                className="flex min-h-0 flex-1 flex-col"
              >
                {body}
              </form>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">{body}</div>
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

/**
 * Garden drawer for committee forms (parent/teacher workspace): Escape and the
 * backdrop close it (unless saving), focus moves to Close on open and returns
 * to the opener on close, full width on phones.
 */
function GardenFormSidePanel({
  open,
  kicker,
  title,
  icon,
  onRequestClose,
  saving = false,
  formId,
  onSubmit,
  children,
  footer,
}: Omit<CommitteeFormSidePanelProps, "theme">) {
  const reduce = useReducedMotion() === true;
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeHandlerRef = useRef(onRequestClose);
  const savingRef = useRef(saving);
  useEffect(() => {
    closeHandlerRef.current = onRequestClose;
    savingRef.current = saving;
  }, [onRequestClose, saving]);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !savingRef.current) closeHandlerRef.current();
    };
    window.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [open]);

  const body = (
    <>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      {footer ? (
        <div className="shrink-0 border-t-[1.5px] border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] px-5 py-4 sm:px-6">
          {footer}
        </div>
      ) : null}
    </>
  );

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[rgba(43,36,29,0.42)] backdrop-blur-[2px]"
            onClick={() => {
              if (!saving) onRequestClose();
            }}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={reduce ? { opacity: 0 } : { x: "100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.3, ease: PORTAL_EASE }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full flex-col overflow-hidden border-l-[1.5px] border-[var(--sf-ink)]/12 bg-white text-[var(--sf-ink)] shadow-[-12px_0_40px_-20px_rgba(43,36,29,0.5)] sm:w-[440px] sm:rounded-l-[24px]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b-[1.5px] border-[var(--sf-ink)]/10 px-5 py-5 sm:px-6">
              <div className="flex min-w-0 items-start gap-3 pr-2">
                {icon ? (
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-[var(--sf-ink)] [&_svg]:!text-[var(--sf-clay-deep)]"
                  >
                    {icon}
                  </span>
                ) : null}
                <div className="min-w-0">
                  <GKicker>{kicker}</GKicker>
                  <h2 className="sf-display m-0 mt-1 text-[1.45rem] leading-[1.05] text-[var(--sf-ink)]">{title}</h2>
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onRequestClose}
                disabled={saving}
                aria-label="Close"
                className={`-mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--sf-ink)]/70 hover:bg-[var(--sf-ink)]/[0.06] disabled:opacity-50 ${G_FOCUS} focus-visible:ring-offset-0`}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            {formId && onSubmit ? (
              <form id={formId} onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col" aria-busy={saving || undefined}>
                {body}
              </form>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">{body}</div>
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
