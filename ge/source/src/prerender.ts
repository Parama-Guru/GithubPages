import { indexableRoutes, routes, type RouteId } from "@/routes/routes";
import { renderFooter, renderHead, renderHeader, renderMenu } from "@/ui/layout";
import { renderMain } from "@/ui/pages";

type RenderedRoute = { id: RouteId; path: string; head: string; header: string; main: string; footer: string; menu: string };

export function renderRoute(id: RouteId): RenderedRoute {
  const current = routes.find((entry) => entry.id === id);
  if (!current) throw new Error(`Unknown route ${id}`);
  return { id, path: current.path, head: renderHead(current), header: renderHeader(current), main: renderMain(id), footer: renderFooter(), menu: renderMenu(current) };
}

export const allRoutes = routes.map((entry) => entry.id);
export const sitemapPaths = indexableRoutes.map((entry) => entry.path);
