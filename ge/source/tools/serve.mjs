import { createReadStream, readFileSync } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { gzipSync } from "node:zlib";

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};
const port = Number(option("--port", "4173"));
const source = path.resolve(import.meta.dirname, "..");
const pagesRoot = path.resolve(source, "..", "..");
const geRoot = args.includes("--published") ? path.resolve(source, "..") : path.join(source, "dist");

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".glb": "model/gltf-binary",
  ".ktx2": "image/ktx2",
  ".wasm": "application/wasm",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".mp3": "audio/mpeg",
};

async function file(target) {
  try {
    const info = await stat(target);
    return info.isFile() ? target : null;
  } catch {
    return null;
  }
}

async function isDirectory(target) {
  try {
    return (await stat(target)).isDirectory();
  } catch {
    return false;
  }
}

const compressible = new Set([".html", ".js", ".css", ".json", ".svg", ".xml", ".txt"]);

function send(request, response, target, status = 200) {
  const type = types[path.extname(target)] ?? "application/octet-stream";
  if (compressible.has(path.extname(target)) && /gzip/.test(request.headers["accept-encoding"] ?? "")) {
    const body = gzipSync(readFileSync(target));
    response.writeHead(status, { "content-type": type, "content-encoding": "gzip", "cache-control": "no-cache", "content-length": body.length });
    response.end(body);
    return;
  }
  response.writeHead(status, { "content-type": type, "cache-control": "no-cache" });
  createReadStream(target).pipe(response);
}

http
  .createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    let base;
    let relative;
    if (pathname.startsWith("/GithubPages/ge/") || pathname === "/GithubPages/ge") {
      base = geRoot;
      relative = pathname.slice("/GithubPages/ge".length);
    } else if (pathname.startsWith("/GithubPages/")) {
      base = pagesRoot;
      relative = pathname.slice("/GithubPages".length);
    } else {
      response.writeHead(302, { location: "/GithubPages/ge/" });
      response.end();
      return;
    }
    const target = path.join(base, relative);
    if (!target.startsWith(base)) {
      response.writeHead(403);
      response.end();
      return;
    }
    if (!pathname.endsWith("/") && (await isDirectory(target))) {
      response.writeHead(301, { location: `${pathname}/${url.search}` });
      response.end();
      return;
    }
    const found = (await file(target)) ?? (await file(path.join(target, "index.html")));
    if (found) return send(request, response, found);
    const missing = await file(path.join(pagesRoot, "404.html"));
    if (missing) return send(request, response, missing, 404);
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("404 — File not found");
  })
  .listen(port, "127.0.0.1", () => console.log(`Serving http://127.0.0.1:${port}/GithubPages/ge/ (${geRoot})`));
