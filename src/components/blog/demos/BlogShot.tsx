import { MobileShotCard, WebShotFrame } from "@/components/features-garden/feature-ui";
import { FEATURE_SHOTS } from "@/lib/marketing/features/shots";
import type { FeatureShot } from "@/lib/marketing/features/types";
import { blogShotUrl, type BlogShotSrc } from "@/lib/marketing/blog-demos";

const SHOT_BY_URL = new Map<string, FeatureShot>(Object.values(FEATURE_SHOTS).flat().map((shot) => [shot.src, shot]));

export function findBlogShot(src: BlogShotSrc): FeatureShot | undefined {
  return SHOT_BY_URL.get(blogShotUrl(src));
}

/**
 * Real screenshots of a feature inside a blog post, for features with no live demo (committees, photos,
 * classroom signups...). One web shot, one phone shot, or a web + phone pair side by side.
 * `<BlogShot src={["photos/web-admin-photos", "photos/mobile-parent-photos"]} caption="…" />`
 */
export default function BlogShot({ src, caption }: { src: BlogShotSrc | BlogShotSrc[]; caption?: string }) {
  const shots = (Array.isArray(src) ? src : [src]).map(findBlogShot).filter((shot): shot is FeatureShot => Boolean(shot));
  if (!shots.length) return null;
  const web = shots.filter((shot) => shot.platform === "web");
  const mobile = shots.filter((shot) => shot.platform === "mobile");

  return (
    <figure className="not-prose relative left-1/2 right-1/2 my-12 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw]">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center px-5 sm:px-8">
        <div className="flex w-full flex-col items-center justify-center gap-8 sm:flex-row sm:items-end">
          {web.map((shot) => (
            <WebShotFrame
              key={shot.src}
              shot={shot}
              label={shot.caption}
              sizes="(min-width: 1024px) 760px, 92vw"
              className={mobile.length ? "w-full sm:w-[72%]" : "w-full max-w-[880px]"}
            />
          ))}
          {mobile.map((shot, index) => (
            <MobileShotCard
              key={shot.src}
              shot={shot}
              tilt={web.length ? 2 : index % 2 ? 2 : -2}
              className="w-[min(240px,62vw)] shrink-0"
            />
          ))}
        </div>
        {caption ? (
          <figcaption className="mt-6 max-w-2xl text-center text-[15px] font-semibold leading-relaxed text-[var(--sf-soft)]">{caption}</figcaption>
        ) : null}
      </div>
    </figure>
  );
}
