"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type AdminDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: "sm" | "md" | "lg";
};

const WIDTH_CLASSES = {
  sm: "w-80",
  md: "w-96",
  lg: "w-[28rem]",
} as const;

export function AdminDrawer({
  open,
  onClose,
  title,
  children,
  width = "md",
}: AdminDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[300] flex justify-end">
          <motion.button
            type="button"
            aria-label="Close drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-admin-text/20"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className={`relative ${WIDTH_CLASSES[width]} h-full bg-admin-surface border-l border-admin-border shadow-lg flex flex-col`}
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-admin-border shrink-0">
              <h2 className="text-sm font-semibold text-admin-text">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-admin-sm text-admin-muted hover:text-admin-text hover:bg-admin-neutral-bg transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
