import { articleJsonLd, serializeJsonLd } from "@/lib/seo";

type ArticleJsonLdProps = {
  headline: string;
  description: string;
  path: string;
  image: string;
  author?: { name: string; url: string };
  datePublished?: string | null;
  dateModified?: string | null;
};

export default function ArticleJsonLd({
  headline,
  description,
  path,
  image,
  author,
  datePublished,
  dateModified,
}: ArticleJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(
          articleJsonLd({
            headline,
            description,
            path,
            image,
            author,
            datePublished,
            dateModified,
          }),
        ),
      }}
    />
  );
}
