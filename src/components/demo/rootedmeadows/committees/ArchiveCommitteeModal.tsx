"use client";

import { Archive, X } from "lucide-react";
import { motion } from "framer-motion";
import type { Committee } from "./types";

export default function ArchiveCommitteeModal({
  committee,
  onClose,
  onConfirm,
}: {
  committee: Committee;
  onClose: () => void;
  onConfirm?: () => void;
}) {
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Archive committee</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <Archive className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Archive {committee.name} ({committee.termLabel})?
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Messages, tasks, and files will be preserved. Members will lose access.
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 mb-2">Bulk uninvite preview</p>
            <ul className="space-y-1">
              {committee.members
                .filter((m) => m.role === "member" || m.role === "lead")
                .map((m) => (
                  <li key={m.id} className="text-sm text-gray-600">
                    {m.name}
                  </li>
                ))}
            </ul>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-gray-300" />
            Duplicate workspace from template for next school year
          </label>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-xl cursor-pointer"
          >
            Archive & prepare rollover
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
