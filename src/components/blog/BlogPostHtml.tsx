type BlogPostHtmlProps = {
  html: string;
};

/** Admin-authored (sanitised) post body in Garden reading type (`.sf-prose`, garden.css). */
export default function BlogPostHtml({ html }: BlogPostHtmlProps) {
  return <div className="sf-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
