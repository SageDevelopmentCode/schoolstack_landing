"use client";

import Image from "next/image";

type DemoStaffAvatarProps = {
  name: string;
  initials: string;
  photoUrl?: string;
  size?: number;
  className?: string;
};

export default function DemoStaffAvatar({
  name,
  initials,
  photoUrl,
  size = 36,
  className = "",
}: DemoStaffAvatarProps) {
  const dimension = `${size}px`;

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{ width: dimension, height: dimension }}
      />
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#827096] text-xs font-bold text-white ${className}`}
      style={{ width: dimension, height: dimension }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
