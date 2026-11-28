"use client";

import { useEffect } from "react";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { G_FOCUS } from "@/components/school-parent/garden/ui";

const TOOL = `inline-flex min-h-[30px] items-center rounded-full border-[1.5px] px-3 py-1 text-[12.5px] font-extrabold transition-colors ${G_FOCUS}`;
const TOOL_ON = "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white";
const TOOL_OFF = "border-transparent text-[var(--sf-ink)]/70 hover:border-[var(--sf-ink)]/20 hover:bg-white hover:text-[var(--sf-ink)]";

type BlogHtmlEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

export default function BlogHtmlEditor({ value, onChange }: BlogHtmlEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],
    content: value || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[280px] px-4 py-3 text-[15px] font-semibold leading-relaxed text-[var(--sf-ink)] focus:outline-none [&_h2]:text-[1.1rem] [&_h2]:font-extrabold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:font-extrabold [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-[var(--sf-clay-deep)] [&_a]:underline",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="rounded-[14px] border-2 border-[var(--sf-ink)]/15 bg-white px-4 py-3 text-sm font-semibold text-[var(--sf-soft)]">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[14px] border-2 border-[var(--sf-ink)]/15 bg-white focus-within:border-[var(--sf-clay)] focus-within:ring-4 focus-within:ring-[var(--sf-clay)]/15">
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-1 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 bg-[var(--sf-paper)] px-2 py-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-pressed={editor.isActive("bold")}
          className={`${TOOL} ${editor.isActive("bold") ? TOOL_ON : TOOL_OFF}`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-pressed={editor.isActive("heading", { level: 2 })}
          className={`${TOOL} ${editor.isActive("heading", { level: 2 }) ? TOOL_ON : TOOL_OFF}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-pressed={editor.isActive("bulletList")}
          className={`${TOOL} ${editor.isActive("bulletList") ? TOOL_ON : TOOL_OFF}`}
        >
          List
        </button>
        <button
          type="button"
          onClick={() => {
            const previous = editor.getAttributes("link").href as string | undefined;
            const url = window.prompt("Link URL", previous ?? "https://");
            if (url === null) return;
            if (!url.trim()) {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
          }}
          aria-pressed={editor.isActive("link")}
          className={`${TOOL} ${editor.isActive("link") ? TOOL_ON : TOOL_OFF}`}
        >
          Link
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
