import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const ssr = path.join(root, "dist-ssr");
const site = "https://parama-guru.github.io/GithubPages/ge/";

const { renderRoute, allRoutes, sitemapPaths } = await import(pathToFileURL(path.join(ssr, "prerender.js")).href);
const template = await readFile(path.join(dist, "index.html"), "utf8");

for (const id of allRoutes) {
  const page = renderRoute(id);
  const html = template
    .replace("<!--app-head-->", page.head)
    .replace("<!--app-header-->", page.header)
    .replace("<!--app-main-->", page.main)
    .replace("<!--app-footer-->", page.footer)
    .replace("<!--app-menu-->", page.menu);
  const file = page.path.endsWith(".html") ? path.join(dist, page.path) : path.join(dist, page.path, "index.html");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
}

// Project pages from the earlier site now live in the 2012–2018 list.
const moved = ["2013-2014", "2014-2016", "2016-2017", "2017-2018"];
for (const slug of moved) {
  const target = `${site}projects/2012-2018/`;
  const file = path.join(dist, "projects", slug, "index.html");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(
    file,
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Projects 2012–2018 — Ganesh Electricals</title><meta name="robots" content="noindex"><link rel="canonical" href="${target}"><meta http-equiv="refresh" content="0; url=../2012-2018/"></head><body><p>This page has moved to <a href="../2012-2018/">Projects 2012–2018</a>.</p></body></html>\n`,
  );
}

const today = new Date().toISOString().slice(0, 10);
const urls = sitemapPaths.map((entry) => `  <url><loc>${site}${entry}</loc><lastmod>${today}</lastmod></url>`).join("\n");
await writeFile(path.join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
await rm(ssr, { recursive: true, force: true });
console.log(`Prerendered ${allRoutes.length} pages.`);
