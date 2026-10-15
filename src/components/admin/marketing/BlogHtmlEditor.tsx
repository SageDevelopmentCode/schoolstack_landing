"use client";

import { useEffect } from "react";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

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
          "min-h-[280px] px-3 py-3 text-sm leading-relaxed text-admin-text focus:outline-none [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-admin-accent [&_a]:underline",
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
      <div className="rounded-admin-md border border-admin-border bg-admin-surface px-3 py-3 text-sm text-admin-muted">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="rounded-admin-md border border-admin-border bg-admin-surface overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-admin-border px-2 py-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded px-2 py-1 text-xs font-medium ${
            editor.isActive("bold") ? "bg-admin-accent-soft text-admin-accent" : "text-admin-muted"
          }`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded px-2 py-1 text-xs font-medium ${
            editor.isActive("heading", { level: 2 })
              ? "bg-admin-accent-soft text-admin-accent"
              : "text-admin-muted"
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded px-2 py-1 text-xs font-medium ${
            editor.isActive("bulletList")
              ? "bg-admin-accent-soft text-admin-accent"
              : "text-admin-muted"
          }`}
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
          className={`rounded px-2 py-1 text-xs font-medium ${
            editor.isActive("link") ? "bg-admin-accent-soft text-admin-accent" : "text-admin-muted"
          }`}
        >
          Link
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
