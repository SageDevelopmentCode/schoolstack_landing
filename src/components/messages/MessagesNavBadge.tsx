type MessagesNavBadgeTheme = {
  accent: string;
  accentLight: string;
};

export function formatMessagesUnreadBadge(count: number): string {
  if (count > 99) return "99+";
  return String(count);
}

export function MessagesNavBadge({
  count,
  theme,
}: {
  count: number;
  theme?: MessagesNavBadgeTheme;
}) {
  if (count <= 0) return null;

  return (
    <span
      className={`ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
        theme ? "" : "bg-slate-200 text-slate-600"
      }`}
      style={
        theme
          ? {
              backgroundColor: theme.accentLight,
              color: theme.accent,
            }
          : undefined
      }
    >
      {formatMessagesUnreadBadge(count)}
    </span>
  );
}
