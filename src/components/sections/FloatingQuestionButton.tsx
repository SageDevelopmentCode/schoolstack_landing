"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function FloatingQuestionButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[150] flex flex-col items-end">
      {/* Expandable sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="sheet"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 w-[320px] rounded-2xl bg-[#F7F1E7] shadow-[0_8px_40px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.07)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.07]">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/Logo.png"
                  alt="MudKitchen"
                  width={22}
                  height={22}
                  className="object-contain"
                />
                <span className="text-[#2E4A3C] font-semibold text-sm font-body">
                  Ask a Question
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-[#2E4A3C]/50 hover:text-[#2E4A3C] hover:bg-black/[0.06] transition-colors"
                aria-label="Close"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M1 1l10 10M11 1L1 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="px-4 py-4 flex flex-col gap-3">
              <textarea
                rows={3}
                placeholder="What's your question?"
                className="w-full resize-none rounded-md bg-white border border-black/[0.09] px-3 py-2.5 text-sm text-[#2E4A3C] placeholder-[#2E4A3C]/40 font-body outline-none focus:ring-2 focus:ring-[#2E4A3C]/30 focus:border-[#2E4A3C] transition"
              />
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-md bg-white border border-black/[0.09] px-3 py-2.5 text-sm text-[#2E4A3C] placeholder-[#2E4A3C]/40 font-body outline-none focus:ring-2 focus:ring-[#2E4A3C]/30 focus:border-[#2E4A3C] transition"
              />
              <input
                type="email"
                placeholder="Your email"
                className="w-full rounded-md bg-white border border-black/[0.09] px-3 py-2.5 text-sm text-[#2E4A3C] placeholder-[#2E4A3C]/40 font-body outline-none focus:ring-2 focus:ring-[#2E4A3C]/30 focus:border-[#2E4A3C] transition"
              />
              <button
                type="button"
                className="w-full rounded-xl bg-[#2E4A3C] hover:bg-[#233B2F] text-white text-sm font-semibold font-body py-2.5 transition-colors"
              >
                Send Question
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 rounded-full bg-[#2E4A3C] hover:bg-[#233B2F] text-white px-4 py-2.5 shadow-lg transition-colors"
        aria-label="Questions?"
      >
        <Image
          src="/images/Logo.png"
          alt=""
          width={20}
          height={20}
          className="object-contain brightness-0 invert"
          aria-hidden
        />
        <span className="text-sm font-semibold font-body pr-0.5">
          Questions?
        </span>
      </motion.button>
    </div>
  );
}
