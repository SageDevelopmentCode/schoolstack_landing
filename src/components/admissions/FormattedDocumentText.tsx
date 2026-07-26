"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { addMarkdownSubsectionBreaks } from "@/lib/admissions/markdown-textarea";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type FormattedDocumentTextProps = {
  content: string;
  C: AdminThemeTokens;
  className?: string;
};

export default function FormattedDocumentText({
  content,
  C,
  className,
}: FormattedDocumentTextProps) {
  const normalizedContent = addMarkdownSubsectionBreaks(content);

  const components: Components = {
    p: ({ children }) => (
      <p
        className="mt-4 text-sm leading-7 first:mt-0"
        style={{ color: C.textPrimary }}
      >
        {children}
      </p>
    ),
    h1: ({ children }) => (
      <h1
        className="mt-8 mb-3 text-lg font-semibold first:mt-0"
        style={{ color: C.textPrimary }}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        className="mt-8 mb-3 text-base font-semibold first:mt-0"
        style={{ color: C.textPrimary }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className="mt-7 mb-2 text-sm font-semibold first:mt-0"
        style={{ color: C.textPrimary }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4
        className="mt-5 mb-1 text-sm font-semibold first:mt-0"
        style={{ color: C.textPrimary }}
      >
        {children}
      </h4>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold" style={{ color: C.textPrimary }}>
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic" style={{ color: C.textPrimary }}>
        {children}
      </em>
    ),
    ul: ({ children }) => (
      <ul
        className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed first:mt-0"
        style={{ color: C.textPrimary }}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed first:mt-0"
        style={{ color: C.textPrimary }}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="mb-1 text-sm leading-relaxed" style={{ color: C.textPrimary }}>
        {children}
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className="mt-4 border-l-2 pl-4 text-sm leading-relaxed first:mt-0"
        style={{ borderColor: C.border, color: C.textSecondary }}
      >
        {children}
      </blockquote>
    ),
    hr: () => (
      <hr
        className="my-6 border-0 border-t"
        style={{ borderColor: C.border }}
      />
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        className="underline"
        style={{ color: C.accent }}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    br: () => <br />,
  };

  return (
    <div className={["space-y-0.5", className].filter(Boolean).join(" ")}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={components}>
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
