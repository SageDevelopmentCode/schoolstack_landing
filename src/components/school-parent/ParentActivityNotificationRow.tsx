"use client";

import {
  ArrowRight,
  Bell,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  Image,
  Heart,
  Megaphone,
  MessageSquare,
  Package,
  type LucideIcon,
} from "lucide-react";
import NavigationLink from "@/components/school/shared/NavigationLink";
import { G_FOCUS, SPRINGY } from "@/components/school-parent/garden/ui";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import {
  formatRelativeTime,
  type ParentActivityNotification,
  type ParentActivityNotificationCategory,
} from "@/lib/parent-portal/parent-activity-notifications";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

type NotificationVisual = {
  Icon: LucideIcon;
  iconBg: string;
  iconColor: string;
};

export function getParentNotificationVisual(
  category: ParentActivityNotificationCategory,
  theme: ParentThemeTokens,
  action?: string,
): NotificationVisual {
  if (action === ACTIVITY_ACTIONS.TEACHER_PARENT_FORM_PUBLISHED) {
    return {
      Icon: FileText,
      iconBg: theme.warningBg,
      iconColor: theme.warning,
    };
  }

  if (action === ACTIVITY_ACTIONS.SCHOOL_GALLERY_PHOTOS_UPLOADED) {
    return {
      Icon: Image,
      iconBg: theme.primarySoft,
      iconColor: theme.primary,
    };
  }

  switch (category) {
    case "messages":
      return {
        Icon: MessageSquare,
        iconBg: theme.primarySoft,
        iconColor: theme.primary,
      };
    case "announcements":
      return {
        Icon: Megaphone,
        iconBg: theme.warningBg,
        iconColor: theme.warning,
      };
    case "events":
      return {
        Icon: CalendarDays,
        iconBg: theme.infoBg,
        iconColor: theme.info,
      };
    case "enrollment":
      return {
        Icon: GraduationCap,
        iconBg: theme.successBg,
        iconColor: theme.success,
      };
    case "payments":
      return {
        Icon: CreditCard,
        iconBg: theme.infoBg,
        iconColor: theme.info,
      };
    case "committees":
      return {
        Icon: Heart,
        iconBg: theme.primarySoft,
        iconColor: theme.primary,
      };
    case "coop":
      return {
        Icon: Package,
        iconBg: theme.successBg,
        iconColor: theme.success,
      };
    case "applications":
      return {
        Icon: ClipboardList,
        iconBg: theme.primarySoft,
        iconColor: theme.primary,
      };
    case "other":
    default:
      return {
        Icon: Bell,
        iconBg: theme.cream,
        iconColor: theme.muted,
      };
  }
}

/** Garden pastel for a notification's icon chip (literal classes for Tailwind). */
function gardenNotificationTint(
  category: ParentActivityNotificationCategory,
  action?: string,
): string {
  if (action === ACTIVITY_ACTIONS.TEACHER_PARENT_FORM_PUBLISHED) return "bg-[var(--sf-butter)]";
  if (action === ACTIVITY_ACTIONS.SCHOOL_GALLERY_PHOTOS_UPLOADED) return "bg-[var(--sf-lav)]";
  switch (category) {
    case "announcements":
      return "bg-[var(--sf-butter)]";
    case "events":
    case "payments":
      return "bg-[var(--sf-sky)]";
    case "enrollment":
    case "coop":
      return "bg-[var(--sf-mint)]";
    case "messages":
    case "applications":
      return "bg-[var(--sf-lav)]";
    case "committees":
      return "bg-[var(--sf-peach)]";
    case "other":
    default:
      return "bg-[var(--sf-ink)]/[0.06]";
  }
}

type ParentActivityNotificationRowProps = {
  notification: ParentActivityNotification;
  theme: ParentThemeTokens;
  onClose: () => void;
  onNavigate?: (href: string) => void;
  /** Arrived since the parent last opened notifications. */
  isNew?: boolean;
};

function NotificationRowContent({
  notification,
  theme,
  isNew,
}: {
  notification: ParentActivityNotification;
  theme: ParentThemeTokens;
  isNew: boolean;
}) {
  const { Icon } = getParentNotificationVisual(
    notification.category,
    theme,
    notification.action,
  );
  const when = formatRelativeTime(notification.createdAt);

  return (
    <>
      <span
        aria-hidden="true"
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-[1.5px] ring-[var(--sf-ink)]/80 ${gardenNotificationTint(
          notification.category,
          notification.action,
        )}`}
      >
        <Icon className="h-[18px] w-[18px] text-[var(--sf-ink)]" strokeWidth={2.3} />
        {isNew ? (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[var(--sf-clay)] ring-2 ring-white" />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="text-[15px] font-extrabold leading-snug text-[var(--sf-ink)]">
            {notification.title}
          </span>
          {isNew ? (
            <span className="mt-0.5 shrink-0 rounded-full bg-[var(--sf-clay)] px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-white">
              New
            </span>
          ) : null}
        </span>
        {notification.detail ? (
          <span className="mt-0.5 line-clamp-2 block text-[13px] font-semibold leading-relaxed text-[var(--sf-soft)]">
            {notification.detail}
          </span>
        ) : null}
        <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] font-bold">
          {when ? <span className="text-[var(--sf-soft)]">{when}</span> : null}
          {when && notification.ctaLabel ? (
            <span aria-hidden="true" className="text-[var(--sf-ink)]/25">
              ·
            </span>
          ) : null}
          {notification.ctaLabel ? (
            <span className="inline-flex items-center gap-1 font-extrabold text-[var(--sf-clay-deep)] group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
              {notification.ctaLabel}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          ) : null}
        </span>
      </span>
    </>
  );
}

export default function ParentActivityNotificationRow({
  notification,
  theme,
  onClose,
  onNavigate,
  isNew = false,
}: ParentActivityNotificationRowProps) {
  const className = `group flex w-full items-start gap-3 rounded-[18px] border-[1.5px] px-3.5 py-3.5 text-left hover:-translate-y-0.5 hover:border-[var(--sf-ink)]/25 hover:shadow-[0_3px_0_0_rgba(43,36,29,0.08)] ${SPRINGY} ${G_FOCUS} ${
    isNew
      ? "border-[var(--sf-clay)]/35 bg-[var(--sf-accent-wash)]"
      : "border-[var(--sf-ink)]/10 bg-white"
  }`;

  if (onNavigate) {
    return (
      <button
        type="button"
        onClick={() => {
          onClose();
          onNavigate(notification.href);
        }}
        className={className}
        data-testid="parent-notification-row"
      >
        <NotificationRowContent notification={notification} theme={theme} isNew={isNew} />
      </button>
    );
  }

  return (
    <NavigationLink
      href={notification.href}
      onClick={onClose}
      className={className}
      data-testid="parent-notification-row"
    >
      <NotificationRowContent notification={notification} theme={theme} isNew={isNew} />
    </NavigationLink>
  );
}
