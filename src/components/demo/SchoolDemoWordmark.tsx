import Image from "next/image";
import type { CSSProperties } from "react";

export interface SchoolDemoLogo {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  text?: string;
  textClassName?: string;
  logoOnDarkClassName?: string;
}

interface SchoolDemoWordmarkProps {
  logo: SchoolDemoLogo;
  className?: string;
  onDark?: boolean;
  style?: CSSProperties;
  sizes?: string;
  priority?: boolean;
}

export default function SchoolDemoWordmark({
  logo,
  className = "",
  onDark = false,
  style,
  sizes,
  priority,
}: SchoolDemoWordmarkProps) {
  if (logo.text) {
    const baseClass =
      logo.textClassName ??
      "font-heading text-lg sm:text-xl font-semibold leading-tight tracking-tight";
    const colorClass = onDark
      ? "text-white"
      : "text-[var(--demo-dark,#15843C)]";
    return (
      <span
        className={`${baseClass} ${colorClass} ${className}`.trim()}
        style={style}
      >
        {logo.text}
      </span>
    );
  }

  if (!logo.src) {
    return (
      <span
        className={`font-display text-sm font-semibold text-gray-800 ${className}`.trim()}
        style={style}
      >
        {logo.text ?? logo.alt}
      </span>
    );
  }

  const imageClass = [
    className,
    onDark && logo.logoOnDarkClassName ? logo.logoOnDarkClassName : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={logo.width ?? 120}
      height={logo.height ?? 32}
      className={imageClass || undefined}
      sizes={sizes}
      priority={priority}
    />
  );
}
