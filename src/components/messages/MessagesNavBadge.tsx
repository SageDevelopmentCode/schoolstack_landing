export function formatMessagesUnreadBadge(count: number): string {
  if (count > 99) return "99+";
  return String(count);
}

export function MessagesNavBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
      {formatMessagesUnreadBadge(count)}
    </span>
  );
}
