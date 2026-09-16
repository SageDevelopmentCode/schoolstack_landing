import { CalendarDays, Mail, MessageSquare, Zap } from "lucide-react";
import { ADMIN_DEMO_STORY_COMPAT } from "@/components/demo/shared/admin-demo-runtime";

export type DemoActivityTimelineVariant =
  | "attendance"
  | "note"
  | "event"
  | "mail"
  | "action";

const DEMO_ACTIVITY_TIMELINE_ICONS: Record<
  DemoActivityTimelineVariant,
  { Icon: typeof Mail; color: string }
> = {
  attendance: { Icon: CalendarDays, color: "#38BDF8" },
  note: { Icon: MessageSquare, color: "#A78BFA" },
  event: { Icon: Zap, color: "#22C55E" },
  mail: { Icon: Mail, color: "#0284C7" },
  action: { Icon: Zap, color: "#16A34A" },
};

function demoActivityAuthorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function demoActivityAuthorAvatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (h + name.charCodeAt(i) * (i + 1)) % 360;
  return `hsl(${h} 38% 42%)`;
}

function DemoActivityAuthorLine({ author }: { author: string }) {
  const C = ADMIN_DEMO_STORY_COMPAT;
  if (!author) return null;
  const initials = demoActivityAuthorInitials(author);
  const color = demoActivityAuthorAvatarColor(author);
  return (
    <div className="mt-1 flex items-center gap-1.5">
      <div
        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[8px] font-bold leading-none"
        style={{ backgroundColor: `${color}22`, color }}
        aria-hidden
      >
        {initials}
      </div>
      <p className="text-[9px]" style={{ color: C.textTertiary }}>
        — {author}
      </p>
    </div>
  );
}

export function DemoActivityTimelineRow({
  variant,
  title,
  date,
  detail,
  author,
  showConnectorBelow,
}: {
  variant: DemoActivityTimelineVariant;
  title: string;
  date: string;
  detail: string;
  author?: string;
  showConnectorBelow: boolean;
}) {
  const C = ADMIN_DEMO_STORY_COMPAT;
  const { Icon, color } = DEMO_ACTIVITY_TIMELINE_ICONS[variant];
  return (
    <div className="flex gap-2.5">
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: color + "20" }}
        >
          <Icon className="h-3 w-3" style={{ color }} />
        </div>
        {showConnectorBelow && (
          <div
            className="my-0.5 min-h-[16px] w-px flex-1"
            style={{ backgroundColor: C.border }}
          />
        )}
      </div>
      <div className="min-w-0 flex-1 pb-4">
        <div className="mb-0.5 flex items-baseline gap-2">
          <p
            className="text-[11px] font-semibold"
            style={{ color: C.textPrimary }}
          >
            {title}
          </p>
          <span
            className="flex-shrink-0 text-[9px]"
            style={{ color: C.textTertiary }}
          >
            {date}
          </span>
        </div>
        <p
          className="text-[10px] leading-relaxed"
          style={{ color: C.textSecondary }}
        >
          {detail}
        </p>
        {author ? <DemoActivityAuthorLine author={author} /> : null}
      </div>
    </div>
  );
}
