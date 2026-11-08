import Image from "next/image";
import { WEBSITE_BLOG_AUTHOR } from "@/lib/website-blog/author";

export default function BlogPostByline() {
  return (
    <p className="mt-3 font-secondary text-sm text-[#1d1a16]/65">
      <a
        href={WEBSITE_BLOG_AUTHOR.profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2.5"
      >
        <Image
          src={WEBSITE_BLOG_AUTHOR.avatarSrc}
          alt={WEBSITE_BLOG_AUTHOR.name}
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
        <span>
          By{" "}
          <span className="text-clay group-hover:underline">
            {WEBSITE_BLOG_AUTHOR.name}
          </span>
        </span>
      </a>
    </p>
  );
}
