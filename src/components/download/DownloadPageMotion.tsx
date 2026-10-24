"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function useDownloadPageParallax() {
  const reduceMotion = useReducedMotion();
  const [parallaxReady, setParallaxReady] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const updateReady = () => setParallaxReady(!reduceMotion && media.matches);
    updateReady();
    media.addEventListener("change", updateReady);
    return () => media.removeEventListener("change", updateReady);
  }, [reduceMotion]);

  useEffect(() => {
    if (!parallaxReady) return;

    const handleMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      setOffset({ x, y });
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [parallaxReady]);

  const animate = !reduceMotion;
  const parallax = parallaxReady ? offset : { x: 0, y: 0 };

  return { parallax, animate };
}

export function DownloadFloatingIllustration({
  src,
  width,
  height,
  className,
  floatDelay = 0,
  parallax = { x: 0, y: 0 },
  parallaxStrength = 1,
  animate = true,
}: {
  src: string;
  width: number;
  height: number;
  className?: string;
  floatDelay?: number;
  parallax?: { x: number; y: number };
  parallaxStrength?: number;
  animate?: boolean;
}) {
  return (
    <motion.div
      className={className}
      style={{
        x: parallax.x * parallaxStrength,
        y: parallax.y * parallaxStrength,
      }}
    >
      <motion.div
        animate={
          animate
            ? {
                y: [0, -10, 0],
              }
            : undefined
        }
        transition={
          animate
            ? {
                duration: 5 + floatDelay,
                repeat: Infinity,
                ease: "easeInOut",
                delay: floatDelay,
              }
            : undefined
        }
      >
        <Image
          src={src}
          alt=""
          aria-hidden
          width={width}
          height={height}
          loading="lazy"
          sizes={`${width}px`}
        />
      </motion.div>
    </motion.div>
  );
}
