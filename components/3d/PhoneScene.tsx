"use client";
/**
 * A5 / M6 — Procedural smartphone (React Three Fiber). Loaded ONLY via next/dynamic
 * from HeroDevice (never in first-load JS). No external assets / no CDN fetches:
 * environment = drei <Environment> with local <Lightformer>s (procedural), screen = CanvasTexture.
 *
 * Perf: ~3k triangles, no postprocessing, dpr clamped, frameloop paused when offscreen / tab
 * hidden, contact shadow baked once (frames=1). Front cover glass = clearcoat + env reflections +
 * faint iridescence (no transmission). Glass BACK = drei MeshTransmissionMaterial (Architect
 * decision) kept cheap: transmissionSampler (re-uses three's shared transmission target, no extra
 * FBO), low samples/resolution, no backside pass. Quality ladder from the FPS guard:
 *   high (MTM) -> < 45 fps: lite (MTM swapped for a physical material) -> < 30 fps: degrade to poster.
 */
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
  RoundedBox,
} from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
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
  /** WebGL context + canvas created (before the first frame). */
  onCreated?: () => void;
  onDegrade?: (reason: string) => void;
  skipFpsGuard?: boolean;
};

type Quality = "high" | "lite";

/** Glass back. high = MeshTransmissionMaterial (cheap settings); lite = physical fallback. */
function GlassBack({ quality, mobile }: { quality: Quality; mobile: boolean }) {
  return (
    <group position={[0, 0, -D / 2]}>
      {/* what the glass refracts: a satin plate + red charging-coil ring (brand accent) */}
      <mesh position={[0, 0, -0.004]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W - 0.1, H - 0.1]} />
        <meshStandardMaterial color="#121216" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, -0.15, -0.006]} rotation={[0, Math.PI, 0]}>
        <ringGeometry args={[0.36, 0.42, 48]} />
        <meshBasicMaterial color={ACCENT} toneMapped={false} />
      </mesh>
      <RoundedBox
        args={[W - 0.06, H - 0.06, 0.03]}
        radius={0.012}
        smoothness={2}
        position={[0, 0, -0.022]}
      >
        {quality === "high" ? (
          <MeshTransmissionMaterial
            transmissionSampler
            samples={mobile ? 2 : 4}
            resolution={mobile ? 128 : 256}
            backside={false}
            thickness={0.12}
            roughness={0.12}
            ior={1.45}
            chromaticAberration={0.04}
            anisotropy={0.1}
            distortion={0.05}
            distortionScale={0.3}
            temporalDistortion={0}
            clearcoat={1}
            clearcoatRoughness={0.04}
            color="#d9d9e0"
            envMapIntensity={1.4}
          />
        ) : (
          <meshPhysicalMaterial
            color="#141418"
            roughness={0.18}
            metalness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={1.4}
          />
        )}
      </RoundedBox>
    </group>
  );
}

function Phone({
  interactive,
  posterMode,
  quality,
  mobile,
}: {
  interactive: boolean;
  posterMode?: boolean;
  quality: Quality;
  mobile: boolean;
}) {
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
        <meshStandardMaterial
          color="#2b2b30"
          metalness={0.9}
          roughness={0.32}
          envMapIntensity={1.2}
        />
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
      {/* glass back (MeshTransmissionMaterial, see header) */}
      <GlassBack quality={quality} mobile={mobile} />
      {/* camera bump with 3 lens rings */}
      <group position={[-0.34, 1.07, -D / 2 - 0.05]}>
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
              <meshPhysicalMaterial
                color="#05060a"
                roughness={0.05}
                clearcoat={1}
                envMapIntensity={2}
              />
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

function FrameHooks({
  onFirstFrame,
  onDegrade,
  onLite,
  skipFpsGuard,
}: Pick<SceneProps, "onFirstFrame" | "onDegrade" | "skipFpsGuard"> & { onLite: () => void }) {
  const frames = useRef(0);
  const sample = useRef({ start: 0, count: 0, round: 0, done: false });
  useFrame((state) => {
    frames.current++;
    if (frames.current === 2) onFirstFrame?.();
    if (skipFpsGuard || sample.current.done) return;
    const now = state.clock.elapsedTime;
    // warm-up 1s, then 2s windows: round 0 < 45fps -> lite (drop MTM) and re-measure;
    // any round < 30fps -> degrade to poster. Max 2 rounds.
    if (now < 1) return;
    const sm = sample.current;
    if (!sm.start) sm.start = now;
    sm.count++;
    const span = now - sm.start;
    if (span < 2) return;
    const fps = sm.count / span;
    if (fps < 30) {
      sm.done = true;
      onDegrade?.(`low-fps:${fps.toFixed(1)}`);
    } else if (fps < 45 && sm.round === 0) {
      sm.round = 1;
      sm.start = 0;
      sm.count = 0;
      onLite();
    } else sm.done = true;
  });
  return null;
}

export default function PhoneScene({
  active,
  interactive,
  mobile,
  posterMode,
  onFirstFrame,
  onCreated,
  onDegrade,
  skipFpsGuard,
}: SceneProps) {
  const [quality, setQuality] = useState<Quality>("high");
  return (
    <Canvas
      dpr={mobile ? [1, 1.25] : [1, 1.75]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: !!posterMode,
      }}
      camera={{ position: [0, 0, 7.2], fov: 30 }}
      frameloop={active ? "always" : "never"}
      className="!h-full !w-full"
      aria-hidden
      // QA detection contract (docs/motion/HOOKS.md "3D hero detection"): the real <canvas>
      // (R3F puts Canvas props on its wrapper div, so the test id is set on gl.domElement).
      onCreated={({ gl }) => {
        gl.domElement.setAttribute("data-testid", "hero-canvas");
        gl.domElement.addEventListener("webglcontextlost", () => onDegrade?.("context-lost"), { once: true });
        onCreated?.();
      }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      {/* subtle red rim light */}
      <pointLight
        position={[-2.6, 1.2, -1.6]}
        color={ACCENT}
        intensity={14}
        distance={7}
        decay={2}
      />
      <pointLight
        position={[2.4, -1.4, -1.4]}
        color={ACCENT}
        intensity={6}
        distance={6}
        decay={2}
      />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 3, 3]} scale={[6, 1.2, 1]} />
        <Lightformer
          form="rect"
          intensity={1.2}
          position={[-4, 0, 2]}
          rotation-y={Math.PI / 2}
          scale={[4, 1.5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          color={ACCENT}
          position={[4, -1, -2]}
          rotation-y={-Math.PI / 2}
          scale={[3, 1, 1]}
        />
        <Lightformer form="ring" intensity={1} position={[0, 0, -4]} scale={2} />
      </Environment>
      <Phone
        interactive={interactive && !mobile}
        posterMode={posterMode}
        quality={quality}
        mobile={mobile}
      />
      <ContactShadows
        position={[0, -1.85, 0]}
        opacity={0.5}
        scale={4.5}
        blur={2.6}
        far={2.5}
        frames={1}
        resolution={256}
        color="#000000"
      />
      <FrameHooks
        onFirstFrame={onFirstFrame}
        onDegrade={onDegrade}
        onLite={() => setQuality("lite")}
        skipFpsGuard={skipFpsGuard || posterMode}
      />
    </Canvas>
  );
}
