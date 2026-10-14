"use client";

import { Check, Copy } from "lucide-react";
import { useLayoutEffect, useMemo, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import DemoStaffAvatar from "@/components/demo/marketing/DemoStaffAvatar";
import AdminButton from "@/components/school-admin/ui/story/AdminButton";
import { useSchoolAdminStoryTheme } from "@/components/school-admin/SchoolAdminStoryShell";
import {
  getDemoTeacherUpdateTabs,
  groupDemoTeacherUpdatesByDay,
  studentInitialsFromName,
  type DemoTeacherUpdateLibraryItem,
} from "@/data/school-demos/demo-newsletter-teacher-update-library";

type NewsletterTeacherUpdatesImportModalProps = {
  open: boolean;
  items: DemoTeacherUpdateLibraryItem[];
  onClose: () => void;
  portalRef?: RefObject<HTMLDivElement | null>;
  portalHost?: HTMLElement | null;
};

export default function NewsletterTeacherUpdatesImportModal({
  open,
  items,
  onClose,
  portalRef,
  portalHost,
}: NewsletterTeacherUpdatesImportModalProps) {
  const { theme, C } = useSchoolAdminStoryTheme();
  const [mountedRoot, setMountedRoot] = useState<HTMLElement | null>(null);
  const [activeTeacherFilter, setActiveTeacherFilter] = useState("chris");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tabs = useMemo(() => getDemoTeacherUpdateTabs(items), [items]);

  const filteredItems = useMemo(() => {
    if (activeTeacherFilter === "all") return items;
    return items.filter((item) => item.teacherId === activeTeacherFilter);
  }, [activeTeacherFilter, items]);

  const dayGroups = useMemo(
    () => groupDemoTeacherUpdatesByDay(filteredItems),
    [filteredItems],
  );

  const showTeacherOnCard = activeTeacherFilter === "all";

  useLayoutEffect(() => {
    if (!open) {
      setMountedRoot(null);
      return;
    }
    setMountedRoot(portalHost ?? portalRef?.current ?? null);
  }, [open, portalHost, portalRef]);

  if (!open) return null;

  const handleCopy = (id: string) => {
    setCopiedId(id);
    window.setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 1500);
  };

  const overlay = (
    <div
      className="absolute inset-0 z-[200] flex items-start justify-center px-4 pt-12 pb-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.55)" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-teacher-updates-import-title"
        className="flex max-h-[min(520px,82%)] w-full max-w-[720px] flex-col overflow-hidden rounded-lg border shadow-lg"
        style={{
          borderColor: C.border,
          backgroundColor: theme.white,
        }}
      >
        <div className="border-b px-4 pt-1.5 pb-2" style={{ borderColor: C.border }}>
          <div
            id="newsletter-teacher-updates-import-title"
            className="text-sm font-bold leading-tight"
            style={{ color: C.textPrimary }}
          >
            Teacher Updates
          </div>
        </div>

        <div
          className="flex shrink-0 gap-4 border-b px-4"
          style={{ borderColor: C.border }}
          role="tablist"
          aria-label="Filter by teacher"
        >
          {tabs.map((tab) => {
            const active = activeTeacherFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTeacherFilter(tab.id)}
                className={`-mb-px shrink-0 border-b-2 pb-2 pt-2 text-xs font-medium transition-colors ${
                  active ? "" : "border-transparent"
                }`}
                style={{
                  borderColor: active ? theme.primary : "transparent",
                  color: active ? theme.primary : theme.muted,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <div className="space-y-4">
            {dayGroups.map((group) => (
              <section key={group.dayKey}>
                <h3
                  className="mb-2 text-[10px] font-extrabold uppercase tracking-widest"
                  style={{ color: "#98A39F" }}
                >
                  {group.dayHeading}
                </h3>
                <div className="grid w-full max-w-[520px] grid-cols-2 gap-2">
                  {group.items.map((item) => {
                    const copied = copiedId === item.id;
                    return (
                      <div key={item.id}>
                        <div
                          className="flex h-full flex-col rounded-md border px-2 py-1.5"
                          style={{
                            borderColor: C.border,
                            backgroundColor: theme.white,
                            opacity: item.alreadyInNewsletter ? 0.65 : 1,
                          }}
                        >
                          {showTeacherOnCard ? (
                            <p
                              className="mb-1 text-[10px] font-semibold leading-none"
                              style={{ color: theme.muted }}
                            >
                              {item.teacherName}
                            </p>
                          ) : null}
                          <div className="flex items-center gap-2">
                            <DemoStaffAvatar
                              name={item.studentName}
                              initials={studentInitialsFromName(item.studentName)}
                              photoUrl={item.studentPhotoUrl}
                              size={28}
                            />
                            <p
                              className="min-w-0 flex-1 text-xs font-semibold leading-none"
                              style={{ color: C.textPrimary }}
                            >
                              For {item.studentName}
                            </p>
                            <AdminButton
                              theme={theme}
                              variant="outline"
                              size="compact"
                              className="inline-flex shrink-0 !min-h-0 items-center gap-1 !px-1.5 !py-0.5 !text-[10px]"
                              onClick={() => handleCopy(item.id)}
                            >
                              {copied ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              {copied ? "Copied" : "Copy"}
                            </AdminButton>
                          </div>
                          <p
                            className="mt-1 line-clamp-2 text-[11px] leading-snug"
                            style={{ color: C.textSecondary }}
                          >
                            {item.preview}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div
          className="flex shrink-0 items-center justify-end gap-2 border-t px-4 py-3"
          style={{ borderColor: C.border }}
        >
          <AdminButton theme={theme} variant="outline" onClick={onClose}>
            Close
          </AdminButton>
        </div>
      </div>
    </div>
  );

  const portalTarget = portalHost ?? portalRef?.current ?? mountedRoot;
  if (portalTarget) {
    return createPortal(overlay, portalTarget);
  }
  if (portalHost !== undefined || portalRef) {
    return null;
  }

  return overlay;
}
