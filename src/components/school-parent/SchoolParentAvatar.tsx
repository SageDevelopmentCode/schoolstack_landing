"use client";

type SchoolParentAvatarProps = {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
  src?: string;
};

export default function SchoolParentAvatar({
  initials,
  color,
  size = "md",
  src,
}: SchoolParentAvatarProps) {
  const sz =
    size === "sm"
      ? "h-7 w-7 text-xs"
      : size === "lg"
        ? "h-12 w-12 text-base"
        : "h-9 w-9 text-sm";

  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        className={`${sz} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sz} flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}
