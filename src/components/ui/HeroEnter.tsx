import type { CSSProperties, ReactNode } from "react";

type HeroEnterProps = {
  children: ReactNode;
  delayMs?: number;
  className?: string;
};

export function HeroEnter({ children, delayMs = 0, className = "" }: HeroEnterProps) {
  return (
    <div
      className={`hero-enter ${className}`.trim()}
      style={{ "--hero-delay": `${delayMs}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
