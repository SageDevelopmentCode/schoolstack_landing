"use client";

import { Fragment, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MobilePhoneFrame from "./MobilePhoneFrame";
import type { MobileShowcaseSlide } from "./types";

type Props = {
  accentColor: string;
  slides: MobileShowcaseSlide[];
};

const AUDIENCE_LABELS: Record<MobileShowcaseSlide["audience"], string> = {
  parent: "Parent",
  admin: "Admin",
  teacher: "Teacher",
};

export default function SchoolMobileAppShowcase({ accentColor, slides }: Props) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = slides[activeSlide];

  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-2 py-6">
      <div className="mb-5 flex w-full items-stretch gap-2">
        {slides.map((item, index) => {
          const Icon = item.icon;
          const prevAudience = index > 0 ? slides[index - 1].audience : null;
          const showDivider = prevAudience !== null && item.audience !== prevAudience;
          return (
            <Fragment key={item.id}>
              {showDivider && (
                <div
                  className="w-px shrink-0 self-center h-9 bg-gray-200"
                  aria-hidden
                />
              )}
              <button
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Show ${item.label}`}
                aria-current={activeSlide === index ? "true" : undefined}
                className={`flex flex-1 min-w-0 flex-col items-center justify-center gap-0.5 min-h-[52px] rounded-xl px-1.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  activeSlide === index
                    ? "text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:text-gray-800"
                }`}
                style={
                  activeSlide === index
                    ? { backgroundColor: accentColor }
                    : { borderColor: `${accentColor}30` }
                }
              >
                <span className="flex items-center gap-1">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="leading-tight truncate">{item.shortLabel}</span>
                </span>
                <span
                  className={`text-[9px] font-medium uppercase tracking-wide leading-none ${
                    activeSlide === index ? "text-white/70" : "text-gray-400"
                  }`}
                >
                  {AUDIENCE_LABELS[item.audience]}
                </span>
              </button>
            </Fragment>
          );
        })}
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <MobilePhoneFrame>{slide.render()}</MobilePhoneFrame>
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="mt-4 text-sm text-gray-500 text-center">{slide.caption}</p>

      <div className="mt-3 flex items-center gap-2">
        {slides.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveSlide(index)}
            aria-label={`Show ${item.label}`}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              activeSlide === index ? "w-5" : "w-2 bg-gray-300"
            }`}
            style={activeSlide === index ? { backgroundColor: accentColor } : undefined}
          />
        ))}
      </div>
    </div>
  );
}
