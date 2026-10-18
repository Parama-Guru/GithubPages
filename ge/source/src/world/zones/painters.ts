import { organisation, type OrgNode } from "@/content/organisation";
import { fonts } from "../textures";

type Ctx = CanvasRenderingContext2D;

function roundRect(context: Ctx, x: number, y: number, w: number, h: number, r: number) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

function wrap(context: Ctx, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export function plaque(year: string, title: string, body: string, lit: number) {
  return (context: Ctx, w: number, h: number) => {
    context.fillStyle = "#0b1016";
    context.fillRect(0, 0, w, h);
    context.strokeStyle = `rgba(227,165,107,${0.25 + lit * 0.6})`;
    context.lineWidth = 4;
    context.strokeRect(6, 6, w - 12, h - 12);
    context.fillStyle = `rgba(242,192,143,${0.35 + lit * 0.65})`;
    context.font = fonts.display(150);
    context.fillText(year, 40, 170);
    context.fillStyle = `rgba(238,242,244,${0.4 + lit * 0.6})`;
    context.font = fonts.sans(40, 600);
    context.fillText(title, 44, 250);
    context.fillStyle = `rgba(170,182,192,${0.4 + lit * 0.6})`;
    context.font = fonts.sans(30, 400);
    wrap(context, body, w - 90).forEach((line, index) => context.fillText(line, 44, 305 + index * 40));
  };
}

export function statScreen(value: string, caption: string, lit: number) {
  return (context: Ctx, w: number, h: number) => {
    const gradient = context.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "#081a26");
    gradient.addColorStop(1, "#04101a");
    context.fillStyle = gradient;
    context.fillRect(0, 0, w, h);
    context.strokeStyle = "rgba(143,216,255,0.18)";
    context.lineWidth = 1;
    for (let y = 0; y < h; y += 6) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(w, y);
      context.stroke();
    }
    context.fillStyle = `rgba(143,216,255,${0.4 + lit * 0.6})`;
    context.font = fonts.mono(26);
    context.fillText(caption.toUpperCase(), 40, 64);
    context.fillStyle = `rgba(255,214,170,${0.5 + lit * 0.5})`;
    context.font = fonts.display(230);
    context.fillText(value, 34, h - 54);
  };
}

export function diagram(progress: number) {
  return (context: Ctx, w: number, h: number) => {
    context.fillStyle = "#04101a";
    context.fillRect(0, 0, w, h);
    context.strokeStyle = "rgba(143,216,255,0.9)";
    context.lineWidth = 5;
    context.lineCap = "round";
    const segments: [number, number, number, number][] = [
      [80, 70, 80, 150],
      [40, 150, w - 40, 150],
      [140, 150, 140, 250],
      [340, 150, 340, 250],
      [540, 150, 540, 250],
      [740, 150, 740, 250],
      [140, 250, 140, 330],
      [340, 250, 340, 330],
      [540, 250, 540, 330],
      [740, 250, 740, 330],
      [60, 380, w - 60, 380],
      [140, 330, 140, 380],
      [340, 330, 340, 380],
      [540, 330, 540, 380],
      [740, 330, 740, 380],
    ];
    const drawn = progress * segments.length;
    segments.forEach(([x1, y1, x2, y2], index) => {
      const t = Math.max(0, Math.min(1, drawn - index));
      if (t <= 0) return;
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
      context.stroke();
    });
    context.fillStyle = "rgba(255,214,170,0.95)";
    for (const x of [140, 340, 540, 740]) {
      if (drawn > 6) {
        context.beginPath();
        context.arc(x, 290, 18, 0, Math.PI * 2);
        context.fill();
      }
    }
  };
}

export function sign(text: string, sub = "") {
  return (context: Ctx, w: number, h: number) => {
    context.fillStyle = "#0c1117";
    context.fillRect(0, 0, w, h);
    context.fillStyle = "#e3a56b";
    context.fillRect(0, 0, 14, h);
    context.fillStyle = "#eef2f4";
    context.font = fonts.display(h * 0.62);
    context.fillText(text, 44, h * 0.72);
    if (sub) {
      context.fillStyle = "#8796a2";
      context.font = fonts.mono(h * 0.16);
      context.fillText(sub, w - context.measureText(sub).width - 30, h * 0.72);
    }
  };
}

export function hazard() {
  return (context: Ctx, w: number, h: number) => {
    context.fillStyle = "#f4f2ea";
    context.fillRect(0, 0, w, h);
    context.fillStyle = "#f2b33c";
    context.strokeStyle = "#111";
    context.lineWidth = 16;
    context.beginPath();
    context.moveTo(w / 2, 40);
    context.lineTo(w - 40, h - 40);
    context.lineTo(40, h - 40);
    context.closePath();
    context.fill();
    context.stroke();
    context.fillStyle = "#111";
    context.beginPath();
    context.moveTo(w * 0.53, h * 0.3);
    context.lineTo(w * 0.42, h * 0.6);
    context.lineTo(w * 0.51, h * 0.6);
    context.lineTo(w * 0.46, h * 0.82);
    context.lineTo(w * 0.6, h * 0.5);
    context.lineTo(w * 0.51, h * 0.5);
    context.closePath();
    context.fill();
  };
}

type Placed = { node: OrgNode; x: number; y: number; w: number; depth: number };

function layout(context: Ctx) {
  const placed: Placed[] = [];
  const gap = 14;
  const rowHeight = 92;
  const widthOf = (node: OrgNode) => {
    context.font = '400 22px "Segoe UI", Arial, sans-serif';
    return Math.max(context.measureText(node.name ?? "").width, context.measureText(node.role).width) + 28;
  };
  const span = (node: OrgNode): number => {
    const own = widthOf(node);
    const children = node.children ?? [];
    if (!children.length) return own;
    return Math.max(own, children.reduce((sum, child) => sum + span(child), 0) + gap * (children.length - 1));
  };
  const place = (node: OrgNode, left: number, depth: number) => {
    const total = span(node);
    const w = widthOf(node);
    placed.push({ node, x: left + total / 2 - w / 2, y: 30 + depth * rowHeight, w, depth });
    let cursor = left + (total - ((node.children ?? []).reduce((sum, child) => sum + span(child), 0) + gap * Math.max(0, (node.children ?? []).length - 1))) / 2;
    for (const child of node.children ?? []) {
      place(child, cursor, depth + 1);
      cursor += span(child) + gap;
    }
  };
  place(organisation, 0, 0);
  return { placed, width: span(organisation) };
}

export function orgBoard(progress: number) {
  return (context: Ctx, w: number, h: number) => {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, w, h);
    const { placed, width } = layout(context);
    const scale = Math.min((w - 60) / width, (h - 40) / (30 + 6 * 92 + 60));
    context.save();
    context.translate((w - width * scale) / 2, 20);
    context.scale(scale, scale);
    const visible = Math.floor(progress * placed.length + 0.001);
    const centre = (item: Placed) => item.x + item.w / 2;
    context.strokeStyle = "#cfcfcf";
    context.lineWidth = 3;
    placed.slice(0, visible).forEach((item) => {
      const children = placed.filter((other) => item.node.children?.includes(other.node) && placed.indexOf(other) < visible);
      if (!children.length) return;
      const mid = item.y + 56 + 18;
      context.beginPath();
      context.moveTo(centre(item), item.y + 56);
      context.lineTo(centre(item), mid);
      const xs = children.map(centre);
      context.moveTo(Math.min(...xs, centre(item)), mid);
      context.lineTo(Math.max(...xs, centre(item)), mid);
      for (const x of xs) {
        context.moveTo(x, mid);
        context.lineTo(x, mid + 18);
      }
      context.stroke();
    });
    placed.slice(0, visible).forEach((item) => {
      context.fillStyle = "#2f77b3";
      roundRect(context, item.x, item.y, item.w, 56, 8);
      context.fill();
      context.fillStyle = "#ffffff";
      context.font = '400 22px "Segoe UI", Arial, sans-serif';
      context.textAlign = "center";
      if (item.node.name) {
        context.fillText(item.node.name, centre(item), item.y + 24);
        context.fillText(item.node.role, centre(item), item.y + 48);
      } else context.fillText(item.node.role, centre(item), item.y + 36);
      context.textAlign = "left";
    });
    context.restore();
  };
}

export function letterbox(image: HTMLImageElement | null) {
  return (context: Ctx, w: number, h: number) => {
    context.fillStyle = "#f3f4f1";
    context.fillRect(0, 0, w, h);
    if (!image || !image.naturalWidth) return;
    const scale = Math.min((w * 0.72) / image.naturalWidth, (h * 0.62) / image.naturalHeight);
    const iw = image.naturalWidth * scale;
    const ih = image.naturalHeight * scale;
    context.drawImage(image, (w - iw) / 2, (h - ih) / 2, iw, ih);
  };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => resolve(element);
    element.src = src;
  });
}
