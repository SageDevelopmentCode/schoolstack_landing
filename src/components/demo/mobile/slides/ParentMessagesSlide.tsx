"use client";

type Props = {
  accentColor: string;
  teacherName: string;
  teacherTitle?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ParentMessagesSlide({
  accentColor,
  teacherName,
  teacherTitle = "Lead Teacher",
}: Props) {
  const initials = getInitials(teacherName);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 shrink-0">
        <div className="relative">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: accentColor }}
          >
            {initials}
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400"
            aria-hidden
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-800 truncate">{teacherName}</p>
            <span
              className="rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              1
            </span>
          </div>
          <p className="text-xs text-gray-500">{teacherTitle}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 bg-gray-50/40">
        <p className="text-center text-[10px] font-medium text-gray-400 uppercase tracking-wide">
          Today
        </p>
        <div className="max-w-[85%]">
          <div className="rounded-2xl rounded-tl-sm bg-white border border-gray-100 shadow-sm px-3 py-2.5 text-sm text-gray-700 leading-relaxed">
            Emma had a wonderful day! She did great in our watercolor session and finished her
            reading project.
          </div>
          <p className="mt-1 text-[10px] text-gray-400 pl-1">9:02 AM</p>
        </div>
        <div className="ml-auto max-w-[85%]">
          <div
            className="rounded-2xl rounded-tr-sm px-3 py-2.5 text-sm text-white shadow-sm leading-relaxed"
            style={{ backgroundColor: accentColor }}
          >
            Thank you! She loves painting at home too.
          </div>
          <p className="mt-1 text-right text-[10px] text-gray-400 pr-1">9:15 AM · Read</p>
        </div>
        <div className="max-w-[85%]">
          <div className="rounded-2xl rounded-tl-sm bg-white border border-gray-100 shadow-sm px-3 py-2.5 text-sm text-gray-700 leading-relaxed">
            So glad to hear it — we&apos;ll share photos from today&apos;s project in the feed
            later.
          </div>
          <p className="mt-1 text-[10px] text-gray-400 pl-1">9:16 AM</p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-gray-100 px-3 py-3 shrink-0 bg-white">
        <input
          readOnly
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-500"
        />
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm"
          style={{ backgroundColor: accentColor }}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
