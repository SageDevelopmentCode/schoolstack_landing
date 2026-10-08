"use client";

/** Static confetti for carousel PNG export (canvas-confetti does not capture in html-to-image). */
const CONFETTI_PIECES: Array<{
  left: string;
  top: string;
  width: number;
  height: number;
  rotate: number;
  color: string;
  opacity: number;
}> = [
  { left: "18%", top: "42%", width: 10, height: 6, rotate: -24, color: "#2E4A3C", opacity: 0.9 },
  { left: "24%", top: "38%", width: 8, height: 5, rotate: 42, color: "#C5D5B8", opacity: 0.85 },
  { left: "32%", top: "45%", width: 7, height: 4, rotate: -12, color: "#E8D5C8", opacity: 0.9 },
  { left: "42%", top: "36%", width: 9, height: 5, rotate: 58, color: "#ff595e", opacity: 0.75 },
  { left: "52%", top: "40%", width: 6, height: 6, rotate: 0, color: "#ffca3a", opacity: 0.85 },
  { left: "58%", top: "34%", width: 11, height: 5, rotate: -35, color: "#1982c4", opacity: 0.8 },
  { left: "66%", top: "44%", width: 8, height: 4, rotate: 22, color: "#8ac926", opacity: 0.8 },
  { left: "72%", top: "38%", width: 7, height: 7, rotate: 45, color: "#6a4c93", opacity: 0.75 },
  { left: "28%", top: "52%", width: 5, height: 5, rotate: 12, color: "#ff924c", opacity: 0.7 },
  { left: "48%", top: "48%", width: 6, height: 4, rotate: -48, color: "#F7F1E7", opacity: 0.9 },
  { left: "62%", top: "50%", width: 9, height: 5, rotate: 30, color: "#2E4A3C", opacity: 0.65 },
  { left: "38%", top: "32%", width: 4, height: 4, rotate: 0, color: "#ff6b9d", opacity: 0.8 },
];

export default function MarketingApplySubmittedConfettiOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[20]"
      aria-hidden="true"
    >
      {CONFETTI_PIECES.map((piece, index) => (
        <span
          key={index}
          style={{
            position: "absolute",
            left: piece.left,
            top: piece.top,
            width: piece.width,
            height: piece.height,
            borderRadius: 1,
            backgroundColor: piece.color,
            opacity: piece.opacity,
            transform: `rotate(${piece.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
