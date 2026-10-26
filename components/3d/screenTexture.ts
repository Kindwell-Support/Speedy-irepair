import { CanvasTexture, SRGBColorSpace } from "three";

/**
 * Procedural screen UI as a CanvasTexture: red-accent "45 MIN" repair ring + status.
 * Rounded corners are baked into the alpha so the plane reads as a real display.
 */
export function createScreenTexture(accent = "#ED1C24"): CanvasTexture {
  const W = 480;
  const H = 1030;
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

  const font = "Inter, Geist, 'Helvetica Neue', Arial, sans-serif";
  // status bar + dynamic island
  g.fillStyle = "#000";
  g.beginPath();
  g.roundRect(W / 2 - 62, 26, 124, 36, 18);
  g.fill();
  g.fillStyle = "rgba(255,255,255,0.85)";
  g.font = `600 22px ${font}`;
  g.fillText("9:41", 44, 52);

  // progress ring
  const cx = W / 2;
  const cy = 430;
  const R = 150;
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
  g.font = `700 120px ${font}`;
  g.fillText("45", cx, cy + 30);
  g.font = `600 26px ${font}`;
  g.fillStyle = "rgba(255,255,255,0.6)";
  g.fillText("MIN", cx, cy + 74);

  // status card
  g.textAlign = "left";
  g.fillStyle = "rgba(255,255,255,0.06)";
  g.beginPath();
  g.roundRect(40, 690, W - 80, 150, 28);
  g.fill();
  g.fillStyle = "#fff";
  g.font = `600 30px ${font}`;
  g.fillText("Screen repair", 72, 750);
  g.fillStyle = "rgba(255,255,255,0.55)";
  g.font = `500 22px ${font}`;
  g.fillText("90-day warranty", 72, 790);
  // check pill
  g.fillStyle = accent;
  g.beginPath();
  g.arc(W - 96, 765, 30, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "#fff";
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(W - 110, 766);
  g.lineTo(W - 99, 777);
  g.lineTo(W - 80, 754);
  g.stroke();

  // home indicator
  g.fillStyle = "rgba(255,255,255,0.7)";
  g.beginPath();
  g.roundRect(W / 2 - 70, H - 34, 140, 8, 4);
  g.fill();

  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
