"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/** Reads a CSS custom property off the nearest .site-theme ancestor (falls
 * back to :root) and converts it to a THREE.Color, so the scene re-colors
 * itself when the visitor switches theme or day/night mode. */
function useThemeColors() {
  const [colors, setColors] = useState({
    accent: new THREE.Color("#c1440e"),
    dome: new THREE.Color("#f2e9d8"),
    ink: new THREE.Color("#1c130c"),
  });

  useEffect(() => {
    const root = document.querySelector(".site-theme") ?? document.documentElement;

    const read = () => {
      const style = getComputedStyle(root);
      const pick = (name: string, fallback: string) => {
        const raw = style.getPropertyValue(name).trim();
        try {
          return new THREE.Color(raw || fallback);
        } catch {
          return new THREE.Color(fallback);
        }
      };
      setColors({
        accent: pick("--glow-amber", "#c1440e"),
        dome: pick("--text-hi", "#f2e9d8"),
        ink: pick("--ink-900", "#1c130c"),
      });
    };

    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-mode", "data-site-theme"] });
    return () => observer.disconnect();
  }, []);

  return colors;
}

function Cloche({ reduceMotion }: { reduceMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { accent, dome, ink } = useThemeColors();
  const { size } = useThree();

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
      g.rotation.y += delta * 0.25;
    }
    const targetX = reduceMotion ? 0.08 : pointer.current.y * 0.18;
    const targetZ = reduceMotion ? 0 : pointer.current.x * -0.18;
    g.rotation.x += (targetX + 0.08 - g.rotation.x) * 0.04;
    g.rotation.z += (targetZ - g.rotation.z) * 0.04;
  });

  const scale = Math.min(1, size.width / 480);

  return (
    <group ref={group} scale={scale}>
      {/* Dome */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <sphereGeometry args={[1.15, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={dome} roughness={0.35} metalness={0.12} />
      </mesh>
      {/* Accent rim where the dome meets the plate */}
      <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.035, 16, 64]} />
        <meshStandardMaterial color={accent} roughness={0.25} metalness={0.4} emissive={accent} emissiveIntensity={0.25} />
      </mesh>
      {/* Knob */}
      <mesh position={[0, 1.52, 0]} castShadow>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshStandardMaterial color={accent} roughness={0.3} metalness={0.4} />
      </mesh>
      {/* Steam curls — off-center on purpose: a symmetric dome spinning in
          place would show no visible motion at all, and this doubles as a
          fresh-from-the-oven flourish rather than motion for its own sake. */}
      <mesh position={[0.55, 1.85, 0.15]} rotation={[0.3, 0.4, 0.9]}>
        <torusGeometry args={[0.22, 0.028, 12, 32, Math.PI * 1.3]} />
        <meshStandardMaterial color="#f2e9d8" roughness={0.6} transparent opacity={0.55} />
      </mesh>
      <mesh position={[0.32, 2.08, -0.05]} rotation={[0.6, -0.3, 0.4]}>
        <torusGeometry args={[0.14, 0.02, 12, 32, Math.PI * 1.1]} />
        <meshStandardMaterial color="#f2e9d8" roughness={0.6} transparent opacity={0.4} />
      </mesh>
      {/* Plate */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.55, 0.12, 64]} />
        <meshStandardMaterial color={ink} roughness={0.5} metalness={0.05} />
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
      camera={{ position: [2.4, 1.8, 3.2], fov: 38 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} castShadow />
      <pointLight position={[-2, 1, -2]} intensity={0.6} color="#ffffff" />
      <Cloche reduceMotion={reduceMotion} />
    </Canvas>
  );
}
