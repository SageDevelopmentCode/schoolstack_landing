import { articleJsonLd } from "@/lib/seo";

type ArticleJsonLdProps = {
  headline: string;
  description: string;
  path: string;
  image: string;
};

export default function ArticleJsonLd({
  headline,
  description,
  path,
  image,
}: ArticleJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          articleJsonLd({ headline, description, path, image }),
        ),
      }}
    />
  );
}
