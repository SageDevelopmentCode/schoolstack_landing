"use client";

import { Users, X } from "lucide-react";
import { motion } from "framer-motion";
import {
  AUGUST_SIGNUP_FAMILY_COUNT,
  COMMITTEE_TEMPLATES,
} from "@/data/school-demos/rooted-meadows-committees";

export default function SendAugustSignupModal({
  onClose,
  onSend,
}: {
  onClose: () => void;
  onSend?: () => void;
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
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Send August volunteer signup
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            Families will receive an email with a short form to rank their committee
            volunteer preferences for the school year.
          </p>
          <div className="flex items-center gap-3 p-4 bg-[#827096]/5 border border-[#827096]/20 rounded-lg">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#827096]/10">
              <Users className="h-4 w-4 text-[#827096]" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">All enrolled families</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {AUGUST_SIGNUP_FAMILY_COUNT} families will receive the signup form
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500">Form includes</p>
            <ul className="space-y-1.5 text-sm text-gray-600">
              {COMMITTEE_TEMPLATES.map((t) => (
                <li key={t.id} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                  {t.name}
                </li>
              ))}
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">
                  ✓
                </span>
                Ranked preference order
              </li>
            </ul>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSend?.();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-[#827096] hover:bg-[#5A4D68] rounded-md cursor-pointer"
          >
            Send to all families
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
