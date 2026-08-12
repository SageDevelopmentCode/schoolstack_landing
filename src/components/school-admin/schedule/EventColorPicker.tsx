"use client";

import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  getColorStyle,
  getDefaultColorKeyForType,
  SCHOOL_EVENT_COLOR_KEYS,
} from "@/lib/school-events/event-labels";
import type { SchoolEventColorKey, SchoolEventType } from "@/lib/school-events/types";

type EventColorPickerProps = {
  C: AdminThemeTokens;
  colorKey: SchoolEventColorKey;
  eventType: SchoolEventType;
  colorManuallySet: boolean;
  onChange: (colorKey: SchoolEventColorKey) => void;
  onManualChange: () => void;
  onResetToDefault: () => void;
};

export default function EventColorPicker({
  C,
  colorKey,
  eventType,
  colorManuallySet,
  onChange,
  onManualChange,
  onResetToDefault,
}: EventColorPickerProps) {
  const defaultKey = getDefaultColorKeyForType(eventType);
  const showReset = colorManuallySet && colorKey !== defaultKey;

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium" style={{ color: C.textTertiary }}>
        Color
      </label>

      <div className="flex flex-wrap gap-2">
        {SCHOOL_EVENT_COLOR_KEYS.map((key) => {
          const style = getColorStyle(key);
          const selected = colorKey === key;
          return (
            <button
              key={key}
              type="button"
              aria-label={`Color ${key}`}
              onClick={() => {
                onManualChange();
                onChange(key);
              }}
              className="h-7 w-7 rounded-full transition-transform hover:scale-105"
              style={{
                backgroundColor: style.text,
                outline: selected ? `2px solid ${C.accent}` : undefined,
                outlineOffset: 2,
              }}
            />
          );
        })}
      </div>

      {showReset ? (
        <button
          type="button"
          onClick={onResetToDefault}
          className="text-xs font-medium underline-offset-2 hover:underline"
          style={{ color: C.accent }}
        >
          Reset to category default
        </button>
      ) : null}
    </div>
  );
}
