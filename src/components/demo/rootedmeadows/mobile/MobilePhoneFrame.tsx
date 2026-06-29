"use client";

import type { ReactNode } from "react";

export const MOBILE_DESIGN_WIDTH = 390;
export const MOBILE_DESIGN_HEIGHT = 844;
/** Wider than the phone — tab bar spans full showcase width */
export const MOBILE_SHOWCASE_WIDTH = 640;

export default function MobilePhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative rounded-[2.5rem] border-[10px] border-gray-900 bg-gray-900 shadow-2xl overflow-hidden"
        style={{
          width: MOBILE_DESIGN_WIDTH,
          height: MOBILE_DESIGN_HEIGHT,
        }}
      >
        <div
          className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 pt-2 pb-1 text-[10px] font-semibold text-gray-800 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.95), transparent)" }}
        >
          <span>9:41</span>
          <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-24 h-6 rounded-full bg-gray-900" />
          <span className="flex items-center gap-1">
            <span className="w-3.5 h-2 rounded-sm border border-gray-800 relative">
              <span className="absolute inset-y-0.5 right-0.5 left-1 bg-gray-800 rounded-[1px]" />
            </span>
          </span>
        </div>
        <div className="relative h-full w-full bg-white overflow-hidden pt-8">
          {children}
        </div>
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-gray-900/80 z-20 pointer-events-none" />
      </div>
    </div>
  );
}
