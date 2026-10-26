"use client";
/**
 * Lazy Rive renderer (dynamic-imported by RiveIcon/RiveLoader only when a .riv exists).
 * WASM is self-hosted at /rive/rive.wasm (no CDN fetch) and loaded once for all icons.
 */
import { useEffect, useRef } from "react";
import { cssVars } from "@/lib/utils/css-vars";
import { useRive, useStateMachineInput, RuntimeLoader, Layout, Fit, Alignment } from "@rive-app/react-canvas";

let wasmConfigured = false;
if (typeof window !== "undefined" && !wasmConfigured) {
  RuntimeLoader.setWasmUrl("/rive/rive.wasm");
  wasmConfigured = true;
}

type Props = {
  src: string;
  stateMachine: string;
  hover?: boolean;
  /** increment to fire the `press` trigger (alias `click`) */
  clickCount?: number;
  /** generic boolean/number inputs (e.g. loader `loading`, button `state`) */
  inputs?: Record<string, boolean | number>;
  onReady?: () => void;
  size: number;
};

export default function RiveCanvas({ src, stateMachine, hover, clickCount = 0, inputs, onReady, size }: Props) {
  const { rive, RiveComponent } = useRive({
    src,
    stateMachines: stateMachine,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoad: () => onReady?.(),
  });
  const hoverInput = useStateMachineInput(rive, stateMachine, "hover");
  // trigger name: `press` (public/rive/README.md, Architect) — `click` accepted as an alias.
  const pressInput = useStateMachineInput(rive, stateMachine, "press");
  const clickAlias = useStateMachineInput(rive, stateMachine, "click");
  const clickInput = pressInput ?? clickAlias;
  const lastClick = useRef(clickCount);

  useEffect(() => {
    if (hoverInput && hover !== undefined) hoverInput.value = hover;
  }, [hover, hoverInput]);

  useEffect(() => {
    if (clickCount !== lastClick.current) {
      lastClick.current = clickCount;
      clickInput?.fire();
    }
  }, [clickCount, clickInput]);

  useEffect(() => {
    if (!rive || !inputs) return;
    const list = rive.stateMachineInputs(stateMachine) ?? [];
    for (const input of list) if (input.name in inputs) input.value = inputs[input.name];
  }, [rive, inputs, stateMachine]);

  return <RiveComponent className="h-[var(--rive-size)] w-[var(--rive-size)]" style={cssVars({ "--rive-size": `${size}px` })} aria-hidden />;
}
