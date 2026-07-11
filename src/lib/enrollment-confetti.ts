"use client";

import { useEffect, useRef } from "react";

const ENROLLMENT_CONFETTI_COLORS = [
  "#ff595e",
  "#ffca3a",
  "#6a4c93",
  "#1982c4",
  "#8ac926",
  "#ff924c",
  "#ffffff",
  "#ff6b9d",
];

export function fireEnrollmentConfetti() {
  const fire = async () => {
    const confetti = (await import("canvas-confetti")).default;
    const colors = ENROLLMENT_CONFETTI_COLORS;

    const burst = (opts: Parameters<typeof confetti>[0]) =>
      confetti({ particleCount: 60, spread: 70, colors, ...opts });

    burst({ origin: { x: 0.3, y: 0.55 } });
    setTimeout(() => burst({ origin: { x: 0.7, y: 0.55 } }), 180);
    setTimeout(
      () =>
        burst({ origin: { x: 0.5, y: 0.4 }, particleCount: 80, spread: 90 }),
      360,
    );
  };

  void fire();
}

export function EnrollmentConfetti({ shouldFire }: { shouldFire: boolean }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!shouldFire || firedRef.current) return;
    firedRef.current = true;
    fireEnrollmentConfetti();
  }, [shouldFire]);

  return null;
}
