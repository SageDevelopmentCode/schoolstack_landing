import Image from "next/image";
import { WEBSITE_BLOG_AUTHOR } from "@/lib/website-blog/author";

export default function BlogPostByline({ className = "mt-6" }: { className?: string }) {
  return (
    <p className={`text-[15px] font-semibold text-[var(--sf-soft)] ${className}`}>
      <a
        href={WEBSITE_BLOG_AUTHOR.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-3 rounded-full pr-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
      >
        <Image
          src={WEBSITE_BLOG_AUTHOR.avatarSrc}
          alt={WEBSITE_BLOG_AUTHOR.name}
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-[var(--sf-ink)]"
        />
        <span>
          By{" "}
          <span className="font-extrabold text-[var(--sf-clay-deep)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 group-hover:decoration-[var(--sf-clay)]">
            {WEBSITE_BLOG_AUTHOR.name}
          </span>
        </span>
      </a>
    </p>
  );
}
