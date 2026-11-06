"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

/** Reads the theme's accent CSS custom property off the nearest .site-theme
 * ancestor, so the hero recolors whenever the visitor switches theme or
 * day/night mode — matching the flat <Logo>'s CSS-driven recolor, just
 * driven from JS since this is a WebGL material, not CSS. */
function useThemeAccent() {
  const [accent, setAccent] = useState("#c1440e");

  useEffect(() => {
    const root = document.querySelector(".site-theme") ?? document.documentElement;
    const read = () => setAccent(getComputedStyle(root).getPropertyValue("--glow-amber").trim() || "#c1440e");
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-mode", "data-site-theme"] });
    return () => observer.disconnect();
  }, []);

  return accent;
}

/** The business's own name, extruded into real 3D geometry from a bundled
 * typeface — generated automatically for any business name, no logo
 * artwork or manual tracing required. */
function ExtrudedWordmark({ text, reduceMotion }: { text: string; reduceMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { size } = useThree();
  const accent = useThemeAccent();
  const font = useLoader(FontLoader, "/fonts/helvetiker_bold.typeface.json");

  const geometry = useMemo(() => {
    const geo = new TextGeometry(text || "Your Business", {
      font,
      size: 1,
      depth: 0.22,
      curveSegments: 6,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.015,
      bevelSegments: 3,
    });
    geo.center();
    return geo;
  }, [font, text]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    // Unlike a logo silhouette, extruded text is only legible roughly
    // face-on — a full continuous spin passes through unreadable edge-on
    // angles. Oscillate gently within a readable range instead, nudged by
    // pointer position, so it still feels alive without ever reading as a
    // thin illegible sliver.
    const targetY = reduceMotion ? 0.35 : 0.35 + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    const targetX = reduceMotion ? -0.08 : -0.08 + pointer.current.y * 0.12;
    const targetZ = reduceMotion ? 0 : pointer.current.x * -0.08;
    g.rotation.y += (targetY - g.rotation.y) * 0.04;
    g.rotation.x += (targetX - g.rotation.x) * 0.04;
    g.rotation.z += (targetZ - g.rotation.z) * 0.04;
  });

  // Longer business names need to shrink more to stay inside the hero
  // frame; width scales roughly linearly with character count for this font.
  const widthScale = Math.min(1, 7 / Math.max(text.length, 1));
  const scale = Math.min(1, size.width / 520) * widthScale;

  return (
    <group ref={group} scale={scale} rotation={[-0.08, 0.35, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={accent} roughness={0.35} metalness={0.2} />
      </mesh>
    </group>
  );
}

export function HeroScene({ businessName, className }: { businessName: string; className?: string }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Reading a browser-only media query: state must start false so
    // server/client markup match, then this effect corrects it once mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const dpr = useMemo<[number, number]>(() => [1, 1.75], []);

  return (
    <Canvas
      className={className}
      shadows
      dpr={dpr}
      camera={{ position: [1.6, 1.1, 4.2], fov: 32 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 3]} intensity={1.2} castShadow />
      <pointLight position={[-2, 1, -2]} intensity={0.4} color="#ffffff" />
      <ExtrudedWordmark text={businessName} reduceMotion={reduceMotion} />
    </Canvas>
  );
}
