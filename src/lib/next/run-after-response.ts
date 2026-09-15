import { after } from "next/server";

/** Schedule work after the HTTP response. Falls back when outside a Next request (tests). */
export function runAfterResponse(task: () => void | Promise<void>): void {
  try {
    after(task);
  } catch {
    void task();
  }
}
