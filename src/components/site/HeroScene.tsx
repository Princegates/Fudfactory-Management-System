"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";

/** Reads the theme's ink/accent CSS custom properties off the nearest
 * .site-theme ancestor, so the medallion recolors whenever the visitor
 * switches theme or day/night mode — matching the flat <Logo>'s CSS-mask
 * recolor, just driven from JS since this is a WebGL material, not CSS. */
function useThemeColors() {
  const [colors, setColors] = useState({ accent: "#c1440e", ink: "#241a11" });

  useEffect(() => {
    const root = document.querySelector(".site-theme") ?? document.documentElement;
    const read = () => {
      const style = getComputedStyle(root);
      const pick = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
      setColors({ accent: pick("--glow-amber", "#c1440e"), ink: pick("--ink-900", "#241a11") });
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-mode", "data-site-theme"] });
    return () => observer.disconnect();
  }, []);

  return colors;
}

function LogoMedallion({ reduceMotion }: { reduceMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { size } = useThree();
  const { accent, ink } = useThemeColors();
  // Just the badge's illustration line-art as a white-on-transparent mask —
  // tinted per-theme via the material's own color, same two-tone split as
  // the flat <LogoMark>. The frame mesh behind (tinted with `ink`) shows
  // through this plane's transparent margin, so the "field" tone never
  // needs to be drawn into the texture at all.
  const texture = useTexture("/logo-icon-mask-illustration.png", (tex) => {
    const t = tex as THREE.Texture;
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
  });

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

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    if (!reduceMotion) {
      g.rotation.y += delta * 0.35;
    }
    const targetX = reduceMotion ? -0.1 : pointer.current.y * 0.22;
    const targetZ = reduceMotion ? 0 : pointer.current.x * -0.12;
    g.rotation.x += (targetX - 0.1 - g.rotation.x) * 0.04;
    g.rotation.z += (targetZ - g.rotation.z) * 0.04;
  });

  const scale = Math.min(1, size.width / 420);

  return (
    <group ref={group} scale={scale} rotation={[-0.1, 0.5, 0]}>
      {/* Frame: a single-material rounded slab gives the medallion its
          depth and sides. RoundedBox's geometry has no per-face groups, so
          a multi-material array here would silently only ever show the
          first material — this is also the badge's "field" tone. */}
      <RoundedBox args={[1.9, 1.9, 0.32]} radius={0.32} smoothness={6} castShadow receiveShadow>
        <meshStandardMaterial color={ink} roughness={0.4} metalness={0.15} />
      </RoundedBox>
      {/* Face: the badge illustration, inset slightly on the front. */}
      <mesh position={[0, 0, 0.161]}>
        <planeGeometry args={[1.55, 1.55]} />
        <meshStandardMaterial map={texture} color={accent} roughness={0.45} metalness={0.1} alphaTest={0.5} />
      </mesh>
    </group>
  );
}

export function HeroScene({ className }: { className?: string }) {
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
      camera={{ position: [2.2, 1.4, 3.4], fov: 36 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={1.15} castShadow />
      <pointLight position={[-2, 1, -2]} intensity={0.5} color="#ffffff" />
      <LogoMedallion reduceMotion={reduceMotion} />
    </Canvas>
  );
}
