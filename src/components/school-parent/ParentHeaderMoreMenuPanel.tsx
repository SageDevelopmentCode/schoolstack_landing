"use client";

import NavigationLink from "@/components/school/shared/NavigationLink";
import { MessagesNavBadge } from "@/components/messages/MessagesNavBadge";
import {
  isParentNavItemActive,
  type ParentNavItem,
} from "@/lib/organization-settings/parent-nav";
import { getParentFeatureIconColor } from "@/lib/organization-settings/parent-feature-icon-styles";
import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";

const parentNavTextClass = "text-[13px] font-semibold";

type ParentHeaderMoreMenuPanelProps = {
  items: ParentNavItem[];
  pathname: string;
  theme: ParentThemeTokens;
  adminCompat: { accent: string; accentLight: string };
  messagesUnreadCount: number;
  committeesUnreadCount: number;
  onClose: () => void;
  onNavigate?: (href: string) => void;
};

function ParentHeaderMoreMenuCell({
  item,
  pathname,
  theme,
  adminCompat,
  messagesUnreadCount,
  committeesUnreadCount,
  onClose,
  onNavigate,
}: {
  item: ParentNavItem;
  pathname: string;
  theme: ParentThemeTokens;
  adminCompat: { accent: string; accentLight: string };
  messagesUnreadCount: number;
  committeesUnreadCount: number;
  onClose: () => void;
  onNavigate?: (href: string) => void;
}) {
  const Icon = item.icon;
  const active = isParentNavItemActive(pathname, item);
  const iconColorClass = getParentFeatureIconColor(item.iconSlug);
  const itemClassName = `flex w-full flex-col items-center justify-center gap-1.5 rounded-lg px-1.5 py-2.5 text-center transition-colors ${parentNavTextClass}`;
  const itemStyle = {
    color: active ? theme.primary : theme.ink,
    backgroundColor: active ? theme.primaryLight : "transparent",
  };

  const badgeCount =
    item.key === "messages"
      ? messagesUnreadCount
      : item.key === "committees"
        ? committeesUnreadCount
        : 0;

  const itemContent = (
    <>
      <span className="relative inline-flex shrink-0">
        <Icon className={`h-5 w-5 ${iconColorClass}`} aria-hidden />
        {badgeCount > 0 ? (
          <span className="absolute -right-2 -top-2">
            <MessagesNavBadge
              count={badgeCount}
              theme={{
                accent: adminCompat.accent,
                accentLight: adminCompat.accentLight,
              }}
            />
          </span>
        ) : null}
      </span>
      <span className="text-[11px] font-semibold leading-snug text-balance">
        {item.name}
      </span>
    </>
  );

  if (onNavigate) {
    return (
      <button
        type="button"
        onClick={() => {
          onNavigate(item.href);
          onClose();
        }}
        className={itemClassName}
        style={itemStyle}
      >
        {itemContent}
      </button>
    );
  }

  return (
    <NavigationLink
      href={item.href}
      onClick={onClose}
      className={itemClassName}
      style={itemStyle}
    >
      {itemContent}
    </NavigationLink>
  );
}

export default function ParentHeaderMoreMenuPanel({
  items,
  pathname,
  theme,
  adminCompat,
  messagesUnreadCount,
  committeesUnreadCount,
  onClose,
  onNavigate,
}: ParentHeaderMoreMenuPanelProps) {
  return (
    <div
      className="absolute right-0 z-[100] mt-1.5 grid w-[min(calc(100vw-2rem),20.5rem)] grid-cols-3 gap-1 overflow-hidden rounded-xl p-2 shadow-lg"
      style={{
        border: `1px solid ${theme.line}`,
        backgroundColor: theme.white,
      }}
    >
      {items.map((item) => (
        <ParentHeaderMoreMenuCell
          key={item.key}
          item={item}
          pathname={pathname}
          theme={theme}
          adminCompat={adminCompat}
          messagesUnreadCount={messagesUnreadCount}
          committeesUnreadCount={committeesUnreadCount}
          onClose={onClose}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
