import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Full-screen newsletter reader (parent and staff): a slim Garden bar and the
 * standalone newsletter document in a sandboxed iframe (no scripts).
 */
export default function NewsletterFullScreenFrame({
  backHref,
  documentSrc,
  title,
}: {
  backHref: string;
  documentSrc: string;
  title: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#F7F1E7]">
      <div className="shrink-0 border-b-[1.5px] border-dashed border-[#2B241D]/15 bg-[#FFFAF4] px-4 py-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 rounded-md text-[14px] font-extrabold text-[#2B241D] hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2B241D]/20"
        >
          <ArrowLeft size={16} strokeWidth={2.4} aria-hidden />
          Back to newsletter
        </Link>
      </div>
      <iframe
        title={title || "School newsletter"}
        src={documentSrc}
        sandbox="allow-popups allow-popups-to-escape-sandbox"
        className="min-h-0 w-full flex-1 border-0"
      />
    </div>
  );
}
