"use client";
/**
 * A5 / M6 — Procedural smartphone (React Three Fiber). Loaded ONLY via next/dynamic
 * from HeroDevice (never in first-load JS). No external assets / no CDN fetches:
 * environment = drei <Environment> with local <Lightformer>s (procedural), screen = CanvasTexture.
 *
 * Perf: ~3k triangles, no postprocessing, no transmission pass (glass = clearcoat +
 * env reflections + slight iridescence = cheap "refraction" sheen), dpr clamped,
 * frameloop paused when offscreen / tab hidden, contact shadow baked once (frames=1).
 */
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { MathUtils, type Group } from "three";
import { createScreenTexture } from "./screenTexture";

const ACCENT = "#ED1C24";
const W = 1.5;
const H = 3.08;
const D = 0.16;

type SceneProps = {
  active: boolean;
  interactive: boolean;
  mobile: boolean;
  /** static pose for the poster render (no motion) */
  posterMode?: boolean;
  onFirstFrame?: () => void;
  onDegrade?: (reason: string) => void;
  skipFpsGuard?: boolean;
};

function Phone({ interactive, posterMode }: { interactive: boolean; posterMode?: boolean }) {
  const group = useRef<Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const t = useRef(0);
  const screen = useMemo(() => createScreenTexture(ACCENT), []);
  useEffect(() => () => screen.dispose(), [screen]);

  useEffect(() => {
    if (!interactive) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [interactive]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g || posterMode) return;
    const d = Math.min(dt, 1 / 20);
    t.current += d;
    // subtle rotation: +-0.32 rad yaw sweep (~7s) + pointer tilt; damped (lambda 6 ~= 160ms settle)
    const yaw = Math.sin(t.current * 0.9) * 0.32 + pointer.current.x * 0.35 - 0.25;
    const pitch = pointer.current.y * 0.18 + 0.06;
    g.rotation.y = MathUtils.damp(g.rotation.y, yaw, 6, d);
    g.rotation.x = MathUtils.damp(g.rotation.x, pitch, 6, d);
    // quick, small bob (amplitude 0.035, ~2.6s) — present, not dreamy
    g.position.y = Math.sin(t.current * 2.4) * 0.035;
  });

  return (
    <group ref={group} rotation={[0.06, -0.38, 0]}>
      {/* body / frame */}
      <RoundedBox args={[W, H, D]} radius={0.15} smoothness={4} bevelSegments={3} creaseAngle={0.4}>
        <meshStandardMaterial color="#2b2b30" metalness={0.9} roughness={0.32} envMapIntensity={1.2} />
      </RoundedBox>
      {/* bezel */}
      <mesh position={[0, 0, D / 2 + 0.0005]}>
        <planeGeometry args={[W - 0.06, H - 0.06]} />
        <meshStandardMaterial color="#050505" roughness={0.4} />
      </mesh>
      {/* emissive screen */}
      <mesh position={[0, 0, D / 2 + 0.002]}>
        <planeGeometry args={[W - 0.14, H - 0.14]} />
        <meshBasicMaterial map={screen} transparent toneMapped={false} />
      </mesh>
      {/* cover glass: clearcoat + env reflections + faint iridescence (cheap refraction sheen) */}
      <mesh position={[0, 0, D / 2 + 0.004]}>
        <planeGeometry args={[W - 0.04, H - 0.04]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          roughness={0.04}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.02}
          iridescence={0.35}
          iridescenceIOR={1.4}
          envMapIntensity={2.2}
          depthWrite={false}
        />
      </mesh>
      {/* glass back */}
      <mesh position={[0, 0, -D / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W - 0.08, H - 0.08]} />
        <meshPhysicalMaterial color="#141418" roughness={0.18} metalness={0.15} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.4} />
      </mesh>
      {/* camera bump with 3 lens rings */}
      <group position={[-0.34, 1.07, -D / 2 - 0.02]}>
        <RoundedBox args={[0.66, 0.66, 0.05]} radius={0.12} smoothness={3}>
          <meshPhysicalMaterial color="#1b1b20" roughness={0.25} metalness={0.4} clearcoat={1} />
        </RoundedBox>
        {[
          [-0.14, 0.14],
          [-0.14, -0.14],
          [0.15, 0],
        ].map(([x, y], i) => (
          <group key={i} position={[x, y, -0.035]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.105, 0.105, 0.04, 32]} />
              <meshStandardMaterial color="#3a3a40" metalness={1} roughness={0.25} />
            </mesh>
            <mesh position={[0, -0.021, 0]}>
              <cylinderGeometry args={[0.075, 0.075, 0.005, 32]} />
              <meshPhysicalMaterial color="#05060a" roughness={0.05} clearcoat={1} envMapIntensity={2} />
            </mesh>
          </group>
        ))}
      </group>
      {/* side buttons */}
      <mesh position={[W / 2 + 0.008, 0.6, 0]}>
        <boxGeometry args={[0.02, 0.36, 0.06]} />
        <meshStandardMaterial color="#2b2b30" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[-W / 2 - 0.008, 0.75, 0]}>
        <boxGeometry args={[0.02, 0.22, 0.06]} />
        <meshStandardMaterial color="#2b2b30" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

function FrameHooks({ onFirstFrame, onDegrade, skipFpsGuard }: Pick<SceneProps, "onFirstFrame" | "onDegrade" | "skipFpsGuard">) {
  const frames = useRef(0);
  const sample = useRef({ start: 0, count: 0, done: false });
  useFrame((state) => {
    frames.current++;
    if (frames.current === 2) onFirstFrame?.();
    if (skipFpsGuard || sample.current.done) return;
    const now = state.clock.elapsedTime;
    // warm-up 1s, then measure 2s; < 30fps average => degrade to poster
    if (now < 1) return;
    if (!sample.current.start) sample.current.start = now;
    sample.current.count++;
    const span = now - sample.current.start;
    if (span >= 2) {
      sample.current.done = true;
      const fps = sample.current.count / span;
      if (fps < 30) onDegrade?.(`low-fps:${fps.toFixed(1)}`);
    }
  });
  return null;
}

export default function PhoneScene({ active, interactive, mobile, posterMode, onFirstFrame, onDegrade, skipFpsGuard }: SceneProps) {
  return (
    <Canvas
      dpr={mobile ? [1, 1.25] : [1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: !!posterMode }}
      camera={{ position: [0, 0, 7.2], fov: 30 }}
      frameloop={active ? "always" : "never"}
      className="!h-full !w-full"
      aria-hidden
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      {/* subtle red rim light */}
      <pointLight position={[-2.6, 1.2, -1.6]} color={ACCENT} intensity={14} distance={7} decay={2} />
      <pointLight position={[2.4, -1.4, -1.4]} color={ACCENT} intensity={6} distance={6} decay={2} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 3, 3]} scale={[6, 1.2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-4, 0, 2]} rotation-y={Math.PI / 2} scale={[4, 1.5, 1]} />
        <Lightformer form="rect" intensity={1.6} color={ACCENT} position={[4, -1, -2]} rotation-y={-Math.PI / 2} scale={[3, 1, 1]} />
        <Lightformer form="ring" intensity={1} position={[0, 0, -4]} scale={2} />
      </Environment>
      <Phone interactive={interactive && !mobile} posterMode={posterMode} />
      <ContactShadows position={[0, -1.85, 0]} opacity={0.5} scale={4.5} blur={2.6} far={2.5} frames={1} resolution={256} color="#000000" />
      <FrameHooks onFirstFrame={onFirstFrame} onDegrade={onDegrade} skipFpsGuard={skipFpsGuard || posterMode} />
    </Canvas>
  );
}
