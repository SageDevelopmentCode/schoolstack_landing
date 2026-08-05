"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useNavigationLoading } from "@/components/school/shared/NavigationLoadingProvider";

type NavigationLinkProps = ComponentProps<typeof Link>;

export default function NavigationLink({
  onClick,
  ...props
}: NavigationLinkProps) {
  const { startNavigation } = useNavigationLoading();

  return (
    <Link
      {...props}
      onClick={(event) => {
        startNavigation();
        onClick?.(event);
      }}
    />
  );
}
