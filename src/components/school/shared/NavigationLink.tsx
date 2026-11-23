"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { useNavigationLoading } from "@/components/school/shared/NavigationLoadingProvider";

type NavigationLinkProps = ComponentProps<typeof Link>;

/**
 * The provider hides the splash when the pathname changes, so only start it
 * for a click that will navigate this tab to a different pathname. New-tab
 * clicks (modifier keys, middle click, `target="_blank"`), the page you're
 * already on and query/hash-only links would otherwise leave it stuck until
 * the fallback timeout.
 */
function shouldShowSplash(
  event: MouseEvent<HTMLAnchorElement>,
  target: string | undefined,
): boolean {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }
  if (target && target !== "_self") return false;
  if (event.currentTarget.hasAttribute("download")) return false;

  const rawHref = event.currentTarget.getAttribute("href");
  if (!rawHref) return false;

  let url: URL;
  try {
    url = new URL(rawHref, window.location.href);
  } catch {
    return false;
  }
  if (url.origin !== window.location.origin) return false;
  return url.pathname !== window.location.pathname;
}

export default function NavigationLink({
  onClick,
  target,
  ...props
}: NavigationLinkProps) {
  const { startNavigation } = useNavigationLoading();

  return (
    <Link
      {...props}
      target={target}
      onClick={(event) => {
        // Run the caller's handler first so it can preventDefault().
        onClick?.(event);
        if (shouldShowSplash(event, target)) {
          startNavigation();
        }
      }}
    />
  );
}
