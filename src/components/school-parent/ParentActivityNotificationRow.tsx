import {
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  Heart,
  Megaphone,
  MessageSquare,
  Package,
  type LucideIcon,
} from "lucide-react";
import NavigationLink from "@/components/school/shared/NavigationLink";
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

type ParentActivityNotificationRowProps = {
  notification: ParentActivityNotification;
  theme: ParentThemeTokens;
  onClose: () => void;
  onNavigate?: (href: string) => void;
};

function NotificationRowContent({
  notification,
  theme,
}: {
  notification: ParentActivityNotification;
  theme: ParentThemeTokens;
}) {
  const { Icon, iconBg, iconColor } = getParentNotificationVisual(
    notification.category,
    theme,
    notification.action,
  );

  return (
    <>
      <div
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[13px]"
        style={{ backgroundColor: iconBg }}
      >
        <Icon className="h-4 w-4" style={{ color: iconColor }} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-semibold leading-snug"
          style={{ color: theme.ink }}
        >
          {notification.title}
        </p>
        <p
          className="mt-0.5 line-clamp-2 text-xs leading-relaxed"
          style={{ color: theme.muted }}
        >
          {notification.detail}
        </p>
        <p className="mt-1.5 text-[11px]" style={{ color: theme.muted }}>
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      <ChevronRight
        className="mt-0.5 h-4 w-4 shrink-0 opacity-30 transition-opacity group-hover:opacity-60"
        style={{ color: theme.muted }}
        aria-hidden
      />
    </>
  );
}

export default function ParentActivityNotificationRow({
  notification,
  theme,
  onClose,
  onNavigate,
}: ParentActivityNotificationRowProps) {
  const className =
    "group flex w-full items-start gap-3 rounded-[14px] border px-3 py-3 text-left transition-colors hover:opacity-95";
  const style = {
    textDecoration: "none" as const,
    color: "inherit" as const,
    borderColor: theme.line,
    backgroundColor: theme.white,
  };

  const hoverHandlers = {
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
      event.currentTarget.style.backgroundColor = theme.cream;
    },
    onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
      event.currentTarget.style.backgroundColor = theme.white;
    },
  };

  if (onNavigate) {
    return (
      <button
        type="button"
        onClick={() => {
          onClose();
          onNavigate(notification.href);
        }}
        className={className}
        style={style}
        {...hoverHandlers}
      >
        <NotificationRowContent notification={notification} theme={theme} />
      </button>
    );
  }

  return (
    <NavigationLink
      href={notification.href}
      onClick={onClose}
      className={className}
      style={style}
      {...hoverHandlers}
    >
      <NotificationRowContent notification={notification} theme={theme} />
    </NavigationLink>
  );
}
