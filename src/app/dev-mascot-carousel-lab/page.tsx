"use client";

// THROWAWAY verification lab for the mascot carousels. Delete after review.
import { toPng } from "html-to-image";
import { MotionGlobalConfig } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MarketingSlideShell, SLIDE_HEIGHT, SLIDE_WIDTH, DEFAULT_CAROUSEL_AUDIENCE_BANNER } from "@/components/admin/marketing/slide-frame";
import { MARKETING_CAROUSELS } from "@/components/admin/marketing/carousels/registry";
import type { MarketingCarousel } from "@/components/admin/marketing/carousels/types";
import { MascotProductSlide } from "@/components/admin/marketing/mascot/mascot-slide-kit";
import * as W from "@/components/admin/marketing/screens/marketing-garden-demo-windows";

MotionGlobalConfig.skipAnimations = true;
const SCALE = 0.36;

const WINDOW_TEST: MarketingCarousel = {
  id: "garden-window-test",
  title: "Garden window test",
  fileSlug: "garden-window-test",
  slides: (
    [
      ["website", <W.GardenWebsiteWindow key="w" />],
      ["website-form", <W.GardenWebsiteWindow key="wf" toForm />],
      ["admin", <W.GardenAdminDashboardWindow key="a" />],
      ["admissions", <W.GardenAdmissionsWindow key="ad" />],
      ["marketing", <W.GardenMarketingWindow key="m" />],
      ["billing", <W.GardenParentBillingWindow key="b" />],
      ["parent-home", <W.GardenParentHomeWindow key="ph" />],
      ["checklist", <W.GardenEnrollmentChecklistWindow key="c" />],
      ["calendar", <W.GardenParentCalendarWindow key="cal" />],
      ["attendance", <W.GardenAttendanceWindow key="at" />],
      ["messages", <W.GardenMessagesWindow key="msg" />],
      ["hours", <W.GardenHoursWindow key="h" />],
      ["forms", <W.GardenTeacherFormsWindow key="f" />],
    ] as [string, ReactNode][]
  ).map(([id, node]) => ({
    id,
    fileName: `${id}.png`,
    render: () => (
      <MascotProductSlide kicker={id} title={id} note="test" mascot={{ name: "pip", view: "point", width: 300, x: -20, y: 980 }} windowTop={300}>
        {node}
      </MascotProductSlide>
    ),
  })),
};

export default function MascotCarouselLab() {
  const [only, setOnly] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    setOnly(new URLSearchParams(window.location.search).get("c"));
  }, []);
  const all = [WINDOW_TEST, ...MARKETING_CAROUSELS.filter((c) => c.id.startsWith("mascot-"))];
  const list = only === undefined ? [] : all.filter((c) => (only ? c.id.includes(only) : c.id !== WINDOW_TEST.id));
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const [status, setStatus] = useState("idle");

  async function exportAll() {
    setStatus("exporting");
    let n = 0;
    for (const c of list) {
      for (const s of c.slides) {
        const node = refs.current[`${c.id}/${s.id}`];
        if (!node) continue;
        try {
          const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 1, width: SLIDE_WIDTH, height: SLIDE_HEIGHT, canvasWidth: SLIDE_WIDTH, canvasHeight: SLIDE_HEIGHT, skipAutoScale: true });
          await fetch("/api/dev-mascot-export", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ carousel: c.fileSlug, fileName: s.fileName, dataUrl }) });
          n++;
          setStatus(`exported ${n}`);
        } catch (e) {
          setStatus(`error at ${c.id}/${s.id}: ${String(e)}`);
          return;
        }
      }
    }
    setStatus(`done ${n}`);
  }

  return (
    <div style={{ padding: 16, background: "#ddd", minHeight: "100vh" }}>
      <button id="export" onClick={exportAll} style={{ padding: "8px 14px", marginBottom: 12 }}>
        Export PNGs
      </button>
      <span id="status" style={{ marginLeft: 12 }}>{status}</span>
      {list.map((c) => (
        <section key={c.id} style={{ marginBottom: 24 }}>
          <h2 style={{ font: "600 14px sans-serif" }}>{c.title}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {c.slides.map((s, i) => (
              <div key={s.id} style={{ width: SLIDE_WIDTH * SCALE, height: SLIDE_HEIGHT * SCALE, overflow: "hidden" }}>
                <div style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT, transform: `scale(${SCALE})`, transformOrigin: "top left" }}>
                  <div
                    ref={(node) => {
                      refs.current[`${c.id}/${s.id}`] = node;
                    }}
                    style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT, overflow: "hidden", position: "relative" }}
                  >
                    <MarketingSlideShell audienceBanner={i === 0 && c.slides.length > 1 ? c.audienceBanner ?? DEFAULT_CAROUSEL_AUDIENCE_BANNER : undefined}>
                      {s.render()}
                    </MarketingSlideShell>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
