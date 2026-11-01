"use client";

import { useEffect, useRef } from "react";

/** Same public IDs as the old Shopify page, so orders keep going to Monte's Reusely account. */
const WIDGET_OPTIONS = {
  tenantId: "6e6ee434e0666307f783a3ac6756eba292e9a49642f5fe62823ac96e0901bc88",
  apiKey: "4BDVDTHXrb194FzDPb5h1hVBJPIJvLiPInYCO5lZwpL3Sh6GVDPPNzaduOzNHBTG",
  disableFloatButton: false,
};

const WIDGET_DOCUMENT = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>html, body { margin: 0; background: #fff; }</style>
  </head>
  <body>
    <div class="buyback-widget"></div>
    <script src="https://widget.reusely.com/v3.js"></script>
    <script>new Buyback(${JSON.stringify(WIDGET_OPTIONS)});</script>
  </body>
</html>`;

/**
 * /sell-your-device: Reusely's buyback widget. Orders go to Reusely, not GHL.
 * It runs in an iframe because it rewrites <head> and blocks pinch-zoom, which crashes React's page navigation.
 */
export function ReuselyWidget() {
  const frameRef = useRef<HTMLIFrameElement>(null);

  // The widget changes height at each step, so keep the iframe sized to it.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    let observer: ResizeObserver | undefined;
    const fitToContent = () => {
      const body = frame.contentDocument?.body;
      if (!body) return;
      observer?.disconnect();
      observer = new ResizeObserver(() => {
        frame.style.height = `${body.scrollHeight}px`;
      });
      observer.observe(body);
    };
    fitToContent();
    frame.addEventListener("load", fitToContent);
    return () => {
      frame.removeEventListener("load", fitToContent);
      observer?.disconnect();
    };
  }, []);

  return (
    <iframe
      ref={frameRef}
      title="Sell your device"
      srcDoc={WIDGET_DOCUMENT}
      className="block min-h-[44rem] w-full rounded-sm border-0 bg-white"
    />
  );
}
