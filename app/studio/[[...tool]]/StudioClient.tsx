"use client";
import dynamic from "next/dynamic";

// Browser-only: Sanity core pulls in jsdom (via isomorphic-dompurify), which crashes when prerendered on the server.
const Studio = dynamic(() => import("./Studio"), { ssr: false });

export function StudioClient() {
  return <Studio />;
}
