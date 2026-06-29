"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { COMMITTEE_TEMPLATES } from "@/data/school-demos/rooted-meadows-committees";

export default function CreateCommitteeModal({
  onClose,
  onCreate,
  preselectedTemplateId = "template-service-sunshine",
  showCreateWorkspaceHint = false,
}: {
  onClose: () => void;
  onCreate?: (templateId: string) => void;
  preselectedTemplateId?: string;
  showCreateWorkspaceHint?: boolean;
}) {
  const [selected, setSelected] = useState(preselectedTemplateId);
  const [hintDismissed, setHintDismissed] = useState(false);
  const template = COMMITTEE_TEMPLATES.find((t) => t.id === selected);
  const showHint = showCreateWorkspaceHint && !hintDismissed;

  const handleCreate = () => {
    if (showHint) setHintDismissed(true);
    onCreate?.(selected);
    onClose();
  };

  const createButton = (
    <motion.button
      type="button"
      onClick={handleCreate}
      animate={
        showHint
          ? {
              boxShadow: [
                "0 0 0 0 rgba(130, 112, 150, 0.65)",
                "0 0 0 10px rgba(130, 112, 150, 0)",
                "0 0 0 0 rgba(130, 112, 150, 0.65)",
              ],
            }
          : undefined
      }
      transition={
        showHint ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : undefined
      }
      className={`px-4 py-2 text-sm font-medium text-white bg-[#827096] hover:bg-[#5A4D68] rounded-md cursor-pointer${
        showHint ? " ring-2 ring-offset-1 ring-[#827096]" : ""
      }`}
    >
      Create workspace
    </motion.button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Create committee</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Template
            </label>
            <div className="mt-2 space-y-2">
              {COMMITTEE_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                    selected === t.id
                      ? "border-[#827096] bg-[#827096]/5"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                </button>
              ))}
            </div>
          </div>
          {template && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500">Preload checklist</p>
              <ul className="space-y-1.5 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                  Role guide & handbook
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                  Meeting dates & deadlines
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">✓</span>
                  Starter tasks from template
                </li>
              </ul>
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Committee name
            </label>
            <input
              defaultValue={template?.name ?? ""}
              className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#827096]/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              School year / term
            </label>
            <input
              defaultValue={template?.defaultTermLabel ?? ""}
              className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-[#827096]/50"
            />
          </div>
        </div>
        <div
          className={`px-6 py-4 border-t border-gray-100 flex justify-end gap-3${
            showHint ? " overflow-visible" : ""
          }`}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer"
          >
            Cancel
          </button>
          {showHint ? (
            <div className="relative inline-flex">
              {createButton}
              <motion.div
                aria-hidden
                animate={{
                  y: [0, -8, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute left-1/2 top-full z-20 flex -translate-x-1/2 pt-1 select-none"
              >
                <span className="text-3xl leading-none">👆</span>
              </motion.div>
            </div>
          ) : (
            createButton
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
