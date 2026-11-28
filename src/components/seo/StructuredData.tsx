import { serializeJsonLd } from "@/lib/seo";

/** Renders any schema.org object as an ld+json script (escaped for safe inlining). */
export default function StructuredData({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
