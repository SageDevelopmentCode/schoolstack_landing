"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, X } from "lucide-react";
import type { CommitteeEvent } from "./types";

const TYPE_COLORS: Record<CommitteeEvent["type"], string> = {
  meeting: "bg-[#827096]/10 text-[#827096]",
  deadline: "bg-amber-100 text-amber-700",
  service: "bg-emerald-100 text-emerald-700",
  event: "bg-[#b3b462]/20 text-[#5C5A30]",
};

function formatEventDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function CommitteeEventDetailSidebar({
  event,
  onClose,
}: {
  event: CommitteeEvent | null;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && event) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [event, onClose]);

  return (
    <AnimatePresence>
      {event && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.15)" }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 w-[380px] z-50 flex flex-col overflow-hidden bg-white border-l border-gray-100 shadow-xl"
          >
            <div className="sticky top-0 z-10 px-6 py-5 flex items-center justify-between border-b border-gray-100 bg-white">
              <h2 className="text-base font-semibold text-gray-800 pr-4 leading-tight">
                {event.title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
              <span
                className={`inline-block text-xs font-semibold uppercase px-2.5 py-1 rounded-full w-fit ${TYPE_COLORS[event.type]}`}
              >
                {event.type}
              </span>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Date</p>
                <p className="text-sm font-semibold text-gray-800">{formatEventDate(event.date)}</p>
              </div>
              {event.time && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Time</p>
                  <p className="text-sm text-gray-700">{event.time}</p>
                </div>
              )}
              {event.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Location</p>
                    <p className="text-sm text-gray-700">{event.location}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
