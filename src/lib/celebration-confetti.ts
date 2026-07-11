import confetti from "canvas-confetti";

export function fireCelebrationConfetti(accentColor: string) {
  const colors = [accentColor, "#2E4A3C", "#C5D5B8", "#E8D5C8", "#F7F1E7"];

  const burst = (origin: { x: number; y: number }, angle: number) =>
    confetti({
      particleCount: 60,
      spread: 70,
      angle,
      origin,
      colors,
      scalar: 1.1,
      gravity: 0.9,
      drift: 0,
    });

  burst({ x: 0.2, y: 0.9 }, 65);
  setTimeout(() => burst({ x: 0.8, y: 0.9 }, 115), 80);
  setTimeout(() => burst({ x: 0.15, y: 0.85 }, 75), 300);
  setTimeout(() => burst({ x: 0.85, y: 0.85 }, 105), 380);
}
