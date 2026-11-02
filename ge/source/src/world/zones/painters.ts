import { organisation, orgSections, type OrgNode } from "@/content/organisation";
import { ink, tone } from "../ink";
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
    context.fillStyle = ink.panel;
    context.fillRect(0, 0, w, h);
    context.strokeStyle = tone(ink.accent, 0.25 + lit * 0.6);
    context.lineWidth = 4;
    context.strokeRect(6, 6, w - 12, h - 12);
    context.fillStyle = tone(ink.accentStrong, 0.35 + lit * 0.65);
    context.font = fonts.display(150);
    context.fillText(year, 40, 170);
    context.fillStyle = tone(ink.text, 0.4 + lit * 0.6);
    context.font = fonts.sans(40, 600);
    context.fillText(title, 44, 250);
    context.fillStyle = tone(ink.muted, 0.4 + lit * 0.6);
    context.font = fonts.sans(30, 400);
    wrap(context, body, w - 90).forEach((line, index) => context.fillText(line, 44, 305 + index * 40));
  };
}

export function statScreen(value: string, caption: string, lit: number) {
  return (context: Ctx, w: number, h: number) => {
    const gradient = context.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, ink.screenTop);
    gradient.addColorStop(1, ink.screenBottom);
    context.fillStyle = gradient;
    context.fillRect(0, 0, w, h);
    context.strokeStyle = tone(ink.screenLine, 0.16);
    context.lineWidth = 1;
    for (let y = 0; y < h; y += 6) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(w, y);
      context.stroke();
    }
    context.fillStyle = tone(ink.screenLine, 0.45 + lit * 0.55);
    context.font = fonts.mono(26);
    context.fillText(caption.toUpperCase(), 40, 64);
    context.fillStyle = tone(ink.screenValue, 0.5 + lit * 0.5);
    context.font = fonts.display(230);
    context.fillText(value, 34, h - 54);
  };
}

export function diagram(progress: number) {
  return (context: Ctx, w: number, h: number) => {
    context.fillStyle = ink.screenBottom;
    context.fillRect(0, 0, w, h);
    context.strokeStyle = tone(ink.screenLine, 0.9);
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
    context.fillStyle = tone(ink.screenValue, 0.95);
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
    context.fillStyle = ink.sign;
    context.fillRect(0, 0, w, h);
    context.fillStyle = ink.accent;
    context.fillRect(0, 0, 14, h);
    context.fillStyle = ink.text;
    context.font = fonts.display(h * 0.62);
    context.fillText(text, 44, h * 0.72);
    if (sub) {
      context.fillStyle = ink.dim;
      context.font = fonts.mono(h * 0.16);
      context.fillText(sub, w - context.measureText(sub).width - 30, h * 0.72);
    }
  };
}

export function hazard() {
  return (context: Ctx, w: number, h: number) => {
    context.fillStyle = "#f4f2ea";
    context.fillRect(0, 0, w, h);
    context.fillStyle = ink.safety;
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

type Placed = { node: OrgNode; x: number; y: number; w: number; parent: number; outline: boolean };

const BOX = 56;
const ROW = 92;

function layout(context: Ctx) {
  const placed: Placed[] = [];
  const gap = 14;
  const teamGap = 60;
  context.font = '400 22px "Segoe UI", Arial, sans-serif';
  const widthOf = (node: OrgNode) => Math.max(context.measureText(node.name ?? "").width, context.measureText(node.role).width) + 28;
  const span = (node: OrgNode): number => {
    const children = node.children ?? [];
    const own = widthOf(node);
    return children.length ? Math.max(own, children.reduce((sum, child) => sum + span(child), 0) + gap * (children.length - 1)) : own;
  };
  const place = (node: OrgNode, left: number, top: number, parent: number, outline: boolean) => {
    const total = span(node);
    const w = widthOf(node);
    const index = placed.length;
    placed.push({ node, x: left + total / 2 - w / 2, y: top, w, parent, outline: outline || Boolean(node.group) });
    const children = node.children ?? [];
    let cursor = left + (total - (children.reduce((sum, child) => sum + span(child), 0) + gap * Math.max(0, children.length - 1))) / 2;
    for (const child of children) {
      place(child, cursor, top + ROW, index, false);
      cursor += span(child) + gap;
    }
  };
  const { core, teams } = orgSections(organisation);
  const coreWidth = span(core);
  const teamsWidth = teams.reduce((sum, team) => sum + span(team), 0) + teamGap * (teams.length - 1);
  const width = Math.max(coreWidth, teamsWidth);
  place(core, (width - coreWidth) / 2, 60, -1, false);
  const teamsTop = Math.max(...placed.map((item) => item.y)) + BOX + 90;
  let cursor = (width - teamsWidth) / 2;
  for (const team of teams) {
    place(team, cursor, teamsTop, -1, true);
    cursor += span(team) + teamGap;
  }
  return { placed, width, teamsTop, height: Math.max(...placed.map((item) => item.y)) + BOX + 10 };
}

export function orgBoard(progress: number) {
  return (context: Ctx, w: number, h: number) => {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, w, h);
    const { placed, width, height, teamsTop } = layout(context);
    const scale = Math.min((w - 60) / width, (h - 30) / height);
    context.save();
    context.translate((w - width * scale) / 2, 15);
    context.scale(scale, scale);
    const visible = Math.floor(progress * placed.length + 0.001);
    const centre = (item: Placed) => item.x + item.w / 2;
    context.fillStyle = "#2f77b3";
    context.font = '500 20px "IBM Plex Mono", monospace';
    context.fillText("CORE TEAM", 0, 26);
    context.fillText("PROJECT TEAM", 0, teamsTop - 34);
    context.strokeStyle = "#e3e7ec";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(0, teamsTop - 60);
    context.lineTo(width, teamsTop - 60);
    context.stroke();
    context.strokeStyle = "#cfcfcf";
    placed.slice(0, visible).forEach((item, index) => {
      const children = placed.filter((other, otherIndex) => other.parent === index && otherIndex < visible);
      if (!children.length) return;
      const mid = item.y + BOX + 18;
      context.beginPath();
      context.moveTo(centre(item), item.y + BOX);
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
    context.font = '400 22px "Segoe UI", Arial, sans-serif';
    context.textAlign = "center";
    placed.slice(0, visible).forEach((item) => {
      roundRect(context, item.x, item.y, item.w, BOX, 8);
      if (item.outline) {
        context.fillStyle = "#ffffff";
        context.fill();
        context.strokeStyle = "#2f77b3";
        context.setLineDash(item.node.group === "team" ? [8, 6] : []);
        context.stroke();
        context.setLineDash([]);
        context.fillStyle = "#2f77b3";
      } else {
        context.fillStyle = "#2f77b3";
        context.fill();
        context.fillStyle = "#ffffff";
      }
      if (item.node.name) {
        context.fillText(item.node.name, centre(item), item.y + 24);
        context.fillText(item.node.role, centre(item), item.y + 48);
      } else context.fillText(item.node.role, centre(item), item.y + 36);
    });
    context.textAlign = "left";
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
