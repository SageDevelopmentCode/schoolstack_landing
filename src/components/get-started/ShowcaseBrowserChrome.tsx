type ShowcaseBrowserChromeProps = {
  className?: string;
};

/** Minimal three-dot bar above scaled showcase demos */
export default function ShowcaseBrowserChrome({
  className = "",
}: ShowcaseBrowserChromeProps) {
  return (
    <div
      className={`flex h-7 shrink-0 items-center gap-1.5 border-b border-black/8 bg-white/90 px-3 ${className}`.trim()}
      aria-hidden
    >
      <span className="h-2 w-2 rounded-full bg-[#1d1a16]/15" />
      <span className="h-2 w-2 rounded-full bg-[#1d1a16]/10" />
      <span className="h-2 w-2 rounded-full bg-[#1d1a16]/10" />
    </div>
  );
}
