"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";

const HeroScene = dynamic(() => import("./HeroScene").then((m) => m.HeroScene), { ssr: false });

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export function HeroVisual() {
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    // WebGL support and viewport width can only be checked client-side:
    // state starts null so server/client markup match, then this effect
    // resolves it. The 3D scene is skipped below `sm` — at that size it
    // renders too small to be worth the WebGL/JS payload on a phone, so
    // mobile gets the same lightweight flat logo it always had.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(hasWebGL() && window.innerWidth >= 640);
  }, []);

  // Before we know (SSR + first paint), or if WebGL/viewport isn't a fit,
  // show the flat animated logo instead — never block the hero on a 3D scene.
  if (ready !== true) {
    return <Logo className="animate-float h-full w-full" />;
  }

  return <HeroScene className="h-full w-full" />;
}
