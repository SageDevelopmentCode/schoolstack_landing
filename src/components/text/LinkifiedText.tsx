import type { CSSProperties, ElementType } from "react";
import { splitPlainTextLinks } from "@/lib/text/plain-text-links";

type LinkifiedTextProps = {
  text: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  linkColor: string;
  linkClassName?: string;
  linkStyle?: CSSProperties;
};

export default function LinkifiedText({
  text,
  as: Component = "span",
  className,
  style,
  linkColor,
  linkClassName = "underline underline-offset-2",
  linkStyle,
}: LinkifiedTextProps) {
  const segments = splitPlainTextLinks(text);

  return (
    <Component className={className} style={style}>
      {segments.map((segment, index) => {
        if (segment.type === "link") {
          return (
            <a
              key={`link-${index}`}
              href={segment.href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
              style={{ color: linkColor, ...linkStyle }}
            >
              {segment.value}
            </a>
          );
        }
        return <span key={`text-${index}`}>{segment.value}</span>;
      })}
    </Component>
  );
}
