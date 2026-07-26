"use client";

import { useRef } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Minus,
} from "lucide-react";
import {
  applyMarkdownFormat,
  type MarkdownFormat,
} from "@/lib/admissions/markdown-textarea";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";

type MarkdownTextareaFieldProps = {
  C: AdminThemeTokens;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  minHeight?: number;
};

function toolbarButtonStyle(C: AdminThemeTokens): React.CSSProperties {
  return {
    color: C.textSecondary,
    borderColor: C.border,
    backgroundColor: C.surface,
  };
}

export default function MarkdownTextareaField({
  C,
  value,
  onChange,
  rows = 12,
  placeholder,
  disabled = false,
  readOnly = false,
  minHeight,
}: MarkdownTextareaFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDisabled = disabled || readOnly;

  const applyFormat = (format: MarkdownFormat) => {
    const textarea = textareaRef.current;
    if (!textarea || isDisabled) return;

    const { selectionStart, selectionEnd } = textarea;
    const result = applyMarkdownFormat(value, selectionStart, selectionEnd, format);
    onChange(result.nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.nextSelectionStart, result.nextSelectionEnd);
    });
  };

  const toolbarButtons: Array<{
    format: MarkdownFormat;
    label: string;
    icon: React.ReactNode;
  }> = [
    { format: "bold", label: "Bold", icon: <Bold className="h-3.5 w-3.5" /> },
    { format: "italic", label: "Italic", icon: <Italic className="h-3.5 w-3.5" /> },
    { format: "heading2", label: "Heading 2", icon: <Heading2 className="h-3.5 w-3.5" /> },
    { format: "heading3", label: "Heading 3", icon: <Heading3 className="h-3.5 w-3.5" /> },
    { format: "bulletList", label: "Bullet list", icon: <List className="h-3.5 w-3.5" /> },
    {
      format: "numberedList",
      label: "Numbered list",
      icon: <ListOrdered className="h-3.5 w-3.5" />,
    },
    {
      format: "horizontalRule",
      label: "Divider",
      icon: <Minus className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="space-y-2">
      {!isDisabled ? (
        <div
          className="flex flex-wrap items-center gap-1 rounded-md border p-1"
          style={{ borderColor: C.border, backgroundColor: C.surface }}
        >
          {toolbarButtons.map((button) => (
            <button
              key={button.format}
              type="button"
              aria-label={button.label}
              title={button.label}
              className="rounded border p-1.5 transition-colors hover:opacity-80"
              style={toolbarButtonStyle(C)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyFormat(button.format)}
            >
              {button.icon}
            </button>
          ))}
        </div>
      ) : null}

      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className="w-full resize-y"
        style={{
          backgroundColor: C.input,
          border: `1px solid ${C.inputBorder}`,
          color: C.textPrimary,
          borderRadius: C.r.md,
          fontSize: "14px",
          padding: "10px 12px",
          boxSizing: "border-box",
          minHeight,
        }}
      />
    </div>
  );
}
