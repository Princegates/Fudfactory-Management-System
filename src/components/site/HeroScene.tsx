"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** Reads the theme's accent CSS custom property off the nearest .site-theme
 * ancestor, so the logo recolors whenever the visitor switches theme or
 * day/night mode — matching the flat <Logo>'s CSS-mask recolor, just driven
 * from JS since this is a WebGL material, not CSS. */
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

/** The full FudFactory lockup (wordmark + icon + tagline), traced from the
 * real artwork's silhouette and extruded into real 3D geometry — actual
 * dimensional letterforms, not a flat image on a plane or backing card. */
function ExtrudedLogo({ reduceMotion }: { reduceMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { size } = useThree();
  const accent = useThemeAccent();
  const svgData = useLoader(SVGLoader, "/logo-full.svg");

  const geometry = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    for (const path of svgData.paths) {
      for (const shape of path.toShapes()) {
        geometries.push(
          new THREE.ExtrudeGeometry(shape, {
            depth: 90,
            bevelEnabled: true,
            bevelThickness: 10,
            bevelSize: 6,
            bevelSegments: 3,
            curveSegments: 8,
          }),
        );
      }
    }
    const merged = mergeGeometries(geometries, false);
    // SVG coordinates are Y-down in raw pixel units. Flipping Y via a
    // negative scale would mirror the geometry (odd number of negated
    // axes), which inverts winding order and leaves normals facing the
    // wrong way — the whole front reads as unlit/black. A 180° rotation
    // around X achieves the same flip without breaking normals.
    merged.scale(0.0026, 0.0026, 0.0026);
    merged.rotateX(Math.PI);
    merged.center();
    return merged;
  }, [svgData]);

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
      g.rotation.y += delta * 0.3;
    }
    const targetX = reduceMotion ? -0.08 : pointer.current.y * 0.18;
    const targetZ = reduceMotion ? 0 : pointer.current.x * -0.1;
    g.rotation.x += (targetX - 0.08 - g.rotation.x) * 0.04;
    g.rotation.z += (targetZ - g.rotation.z) * 0.04;
  });

  const scale = Math.min(1, size.width / 520);

  return (
    <group ref={group} scale={scale} rotation={[-0.08, 0.35, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color={accent} roughness={0.35} metalness={0.2} />
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
      camera={{ position: [1.6, 1.1, 4.2], fov: 32 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 4, 3]} intensity={1.2} castShadow />
      <pointLight position={[-2, 1, -2]} intensity={0.4} color="#ffffff" />
      <ExtrudedLogo reduceMotion={reduceMotion} />
    </Canvas>
  );
}
