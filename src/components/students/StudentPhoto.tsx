"use client";

import { useRef, type ChangeEvent } from "react";
import { Camera, Loader2 } from "lucide-react";
import { studentInitialsFromName } from "@/lib/students/student-initials";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type StudentPhotoSize = "sm" | "md" | "lg" | "xl";
type StudentPhotoShape = "circle" | "square";

type StudentPhotoProps = {
  name: string;
  photoUrl?: string | null;
  size?: StudentPhotoSize;
  shape?: StudentPhotoShape;
  /** Theme tokens for initials fallback background (parent portal). */
  theme?: AdminThemeTokens;
  /** Fallback accent when theme is not provided (staff portals). */
  accentColor?: string;
  accentGlowColor?: string;
  editable?: boolean;
  uploading?: boolean;
  onFileSelect?: (file: File) => void;
  className?: string;
};

const SIZE_CLASSES: Record<StudentPhotoSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-14 w-14 text-lg",
};

const SHAPE_CLASSES: Record<StudentPhotoShape, string> = {
  circle: "rounded-full",
  square: "rounded-2xl",
};

export default function StudentPhoto({
  name,
  photoUrl,
  size = "md",
  shape = "circle",
  theme,
  accentColor,
  accentGlowColor,
  editable = false,
  uploading = false,
  onFileSelect,
  className = "",
}: StudentPhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const initials = studentInitialsFromName(name);
  const sizeClass = SIZE_CLASSES[size];
  const shapeClass = SHAPE_CLASSES[shape];

  const backgroundColor =
    accentGlowColor ?? theme?.accentGlow ?? accentColor ?? "#E8E0F0";
  const textColor = theme?.accentDark ?? accentColor ?? "#5B4B8A";

  function handleClick() {
    if (!editable || uploading) return;
    inputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  }

  const content = photoUrl ? (
    <img
      src={photoUrl}
      alt={name}
      className={`${sizeClass} ${shapeClass} shrink-0 object-cover ${className}`}
    />
  ) : (
    <div
      className={`${sizeClass} ${shapeClass} flex shrink-0 items-center justify-center font-semibold ${className}`}
      style={{ backgroundColor, color: textColor }}
    >
      {initials}
    </div>
  );

  if (!editable) {
    return content;
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className={`group relative overflow-hidden ${shapeClass} disabled:cursor-not-allowed`}
        aria-label={`Change photo for ${name}`}
      >
        {content}
        <span
          className={`absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${shapeClass}`}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Camera className="h-5 w-5 text-white" />
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  );
}
