"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

export function StatCounter({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center">
      <p className="font-display text-3xl font-bold text-gradient sm:text-4xl">
        {display}
        {suffix}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-lo)" }}>
        {label}
      </p>
    </div>
  );
}
