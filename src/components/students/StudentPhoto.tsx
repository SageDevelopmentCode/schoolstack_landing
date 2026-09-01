"use client";

import { useRef, type ChangeEvent } from "react";
import { Asterisk, Camera, Loader2 } from "lucide-react";
import { studentInitialsFromName } from "@/lib/students/student-initials";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type StudentPhotoSize = "sm" | "md" | "lg" | "xl" | "2xl";
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
  showEditHint?: boolean;
  onFileSelect?: (file: File) => void;
  className?: string;
  healthIndicator?: boolean;
  healthIndicatorColor?: string;
};

const SIZE_CLASSES: Record<StudentPhotoSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-14 w-14 text-lg",
  "2xl": "h-20 w-20 text-xl",
};

const BADGE_ICON_CLASSES: Record<StudentPhotoSize, string> = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
  xl: "h-4 w-4",
  "2xl": "h-4 w-4",
};

const BADGE_CONTAINER_CLASSES: Record<StudentPhotoSize, string> = {
  sm: "h-4 w-4 -bottom-0.5 -right-0.5",
  md: "h-5 w-5 -bottom-0.5 -right-0.5",
  lg: "h-5 w-5 -bottom-1 -right-1",
  xl: "h-6 w-6 -bottom-1 -right-1",
  "2xl": "h-7 w-7 -bottom-1 -right-1",
};

const HEALTH_BADGE_CONTAINER_CLASSES: Record<
  StudentPhotoSize,
  { right: string; left: string }
> = {
  sm: {
    right: "h-4 w-4 -bottom-0.5 -right-0.5",
    left: "h-4 w-4 -bottom-0.5 -left-0.5",
  },
  md: {
    right: "h-5 w-5 -bottom-0.5 -right-0.5",
    left: "h-5 w-5 -bottom-0.5 -left-0.5",
  },
  lg: {
    right: "h-5 w-5 -bottom-1 -right-1",
    left: "h-5 w-5 -bottom-1 -left-1",
  },
  xl: {
    right: "h-6 w-6 -bottom-1 -right-1",
    left: "h-6 w-6 -bottom-1 -left-1",
  },
  "2xl": {
    right: "h-7 w-7 -bottom-1 -right-1",
    left: "h-7 w-7 -bottom-1 -left-1",
  },
};

const DEFAULT_HEALTH_INDICATOR_COLOR = "#EF4444";

function HealthIndicatorBadge({
  size,
  color,
  position = "right",
}: {
  size: StudentPhotoSize;
  color: string;
  position?: "left" | "right";
}) {
  const positionClass =
    position === "left"
      ? HEALTH_BADGE_CONTAINER_CLASSES[size].left
      : HEALTH_BADGE_CONTAINER_CLASSES[size].right;

  return (
    <span
      className={`absolute flex items-center justify-center rounded-full border-2 border-white shadow-sm ${positionClass}`}
      style={{ backgroundColor: color }}
      title="Has allergies or medications on file"
      aria-label="Has allergies or medications on file"
    >
      <Asterisk className={`${BADGE_ICON_CLASSES[size]} text-white`} aria-hidden />
    </span>
  );
}

const OVERLAY_ICON_CLASSES: Record<StudentPhotoSize, string> = {
  sm: "h-4 w-4",
  md: "h-4 w-4",
  lg: "h-5 w-5",
  xl: "h-5 w-5",
  "2xl": "h-6 w-6",
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
  showEditHint = false,
  onFileSelect,
  className = "",
  healthIndicator = false,
  healthIndicatorColor = DEFAULT_HEALTH_INDICATOR_COLOR,
}: StudentPhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const initials = studentInitialsFromName(name);
  const sizeClass = SIZE_CLASSES[size];
  const shapeClass = SHAPE_CLASSES[shape];
  const ringColor = theme?.accent ?? accentColor ?? "#7C6BA8";

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
    if (!healthIndicator) {
      return content;
    }

    return (
      <div className="relative shrink-0">
        {content}
        <HealthIndicatorBadge size={size} color={healthIndicatorColor} />
      </div>
    );
  }

  const overlayVisible = uploading;

  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className={`group relative overflow-hidden border-2 border-dashed disabled:cursor-not-allowed ${shapeClass}`}
          style={{ borderColor: ringColor }}
          aria-label={`Change photo for ${name}`}
        >
          {content}
          <span
            className={`absolute inset-0 flex items-center justify-center bg-black/45 transition-opacity ${shapeClass} ${
              overlayVisible
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
            }`}
          >
            {uploading ? (
              <Loader2
                className={`${OVERLAY_ICON_CLASSES[size]} animate-spin text-white`}
              />
            ) : (
              <Camera className={`${OVERLAY_ICON_CLASSES[size]} text-white`} />
            )}
          </span>
        </button>
        {!uploading ? (
          <span
            className={`absolute flex items-center justify-center rounded-full border-2 border-white shadow-sm ${BADGE_CONTAINER_CLASSES[size]}`}
            style={{ backgroundColor: ringColor }}
            aria-hidden
          >
            <Camera className={`${BADGE_ICON_CLASSES[size]} text-white`} />
          </span>
        ) : null}
        {healthIndicator ? (
          <HealthIndicatorBadge
            size={size}
            color={healthIndicatorColor}
            position="left"
          />
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={handleFileChange}
        />
      </div>
      {showEditHint ? (
        <span className="text-[11px] font-medium" style={{ color: theme?.textTertiary ?? "#6B7280" }}>
          Change photo
        </span>
      ) : null}
    </div>
  );
}
