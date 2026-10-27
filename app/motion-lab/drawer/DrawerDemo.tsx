"use client";
import { useRef, useState } from "react";
import { CountUp } from "@/components/motion/CountUp";
import { Drawer } from "@/components/motion/Drawer";

const btn = "inline-flex h-control-lg items-center gap-2 rounded-md px-6 font-semibold";

export function DrawerDemo() {
  const [open, setOpen] = useState(false);
  const checkoutRef = useRef<HTMLButtonElement>(null);
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-4">
        <h2 className="text-h3">Drawer (cart)</h2>
        <button type="button" className={`${btn} w-fit bg-primary text-text hover:bg-primary-hover`} onClick={() => setOpen(true)}>
          Add to cart
        </button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Your cart"
          testId="cart-drawer"
          initialFocusRef={checkoutRef}
          footer={
            <button ref={checkoutRef} type="button" className={`${btn} w-full justify-center bg-primary text-text`} onClick={() => setOpen(false)}>
              Checkout
            </button>
          }
        >
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            <li className="rounded-md border border-border p-4">iPhone 13 (placeholder product)</li>
            <li className="rounded-md border border-border p-4">USB-C cable (placeholder product)</li>
          </ul>
          <a href="#count" className="mt-6 inline-block text-body-sm underline">A link inside (focus trap test)</a>
        </Drawer>
      </div>
      <div id="count" className="flex flex-col gap-4">
        <h2 className="text-h3">CountUp</h2>
        <p className="text-display font-bold">
          <CountUp value={40} prefix="$" />
          <span className="text-h4">/mo</span>
        </p>
        <p className="text-h2">
          <CountUp value={45} duration={0.48} /> min · <CountUp value={90} duration={0.48} /> days
        </p>
        <p className="text-h2" data-testid="countup-hook">
          <span data-animate="countup">$1,200</span>+ repairs · <span data-animate="countup">4.9</span> (engine hook, no component)
        </p>
      </div>
    </div>
  );
}
