import { CanvasTexture, SRGBColorSpace } from "three";

/**
 * Procedural screen UI as a CanvasTexture: red-accent "45 MIN" repair ring + status.
 * Rounded corners are baked into the alpha so the plane reads as a real display.
 */
export function createScreenTexture(accent = "#ED1C24"): CanvasTexture {
  const W = 460;
  const H = 960;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const r = 58;
  g.beginPath();
  g.roundRect(0, 0, W, H, r);
  g.clip();

  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#16161a");
  bg.addColorStop(1, "#070708");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  // soft red glow behind the ring
  const glow = g.createRadialGradient(W / 2, 430, 10, W / 2, 430, 300);
  glow.addColorStop(0, "rgba(230,57,70,0.28)");
  glow.addColorStop(1, "rgba(230,57,70,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, W, H);

  const font = "Rajdhani, Inter, Geist, 'Helvetica Neue', Arial, sans-serif";
  const headingFont = "Orbitron, " + font;
  // status bar + dynamic island
  g.fillStyle = "#000";
  g.beginPath();
  g.roundRect(W / 2 - 56, 22, 112, 32, 16);
  g.fill();
  g.fillStyle = "rgba(255,255,255,0.85)";
  g.font = `600 20px ${font}`;
  g.fillText("9:41", 40, 46);

  // progress ring
  const cx = W / 2;
  const cy = 390;
  const R = 140;
  g.lineCap = "round";
  g.lineWidth = 18;
  g.strokeStyle = "rgba(255,255,255,0.08)";
  g.beginPath();
  g.arc(cx, cy, R, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = accent;
  g.beginPath();
  g.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.82);
  g.stroke();

  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.font = `700 110px ${headingFont}`;
  g.fillText("45", cx, cy + 28);
  g.font = `600 24px ${headingFont}`;
  g.fillStyle = "rgba(255,255,255,0.6)";
  g.fillText("MIN", cx, cy + 66);

  // status card
  g.textAlign = "left";
  g.fillStyle = "rgba(255,255,255,0.06)";
  g.beginPath();
  g.roundRect(36, 630, W - 72, 140, 24);
  g.fill();
  g.fillStyle = "#fff";
  g.font = `600 28px ${font}`;
  g.fillText("Screen repair", 64, 686);
  g.fillStyle = "rgba(255,255,255,0.55)";
  g.font = `500 20px ${font}`;
  g.fillText("90-day warranty", 64, 720);
  // check pill
  g.fillStyle = accent;
  g.beginPath();
  g.arc(W - 86, 700, 28, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#fff";
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(W - 100, 701);
  g.lineTo(W - 89, 712);
  g.lineTo(W - 72, 690);
  g.stroke();

  // home indicator
  g.fillStyle = "rgba(255,255,255,0.7)";
  g.beginPath();
  g.roundRect(W / 2 - 60, H - 30, 120, 7, 4);
  g.fill();

  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
