import { breadcrumbJsonLd, serializeJsonLd, type BreadcrumbItem } from "@/lib/seo";

type BreadcrumbJsonLdProps = {
  items: BreadcrumbItem[];
};

export default function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(breadcrumbJsonLd(items)),
      }}
    />
  );
}
