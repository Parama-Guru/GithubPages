import { organisation, type OrgNode } from "@/content/organisation";
import { esc } from "./html";

function node(entry: OrgNode): string {
  const children = entry.children ?? [];
  const label = entry.name ? `<span class="org-name">${esc(entry.name)}</span><span class="org-role">${esc(entry.role)}</span>` : `<span class="org-role">${esc(entry.role)}</span>`;
  const list = children.length ? `<ul>${children.map(node).join("")}</ul>` : "";
  return `<li><div class="org-box">${label}</div>${list}</li>`;
}

export function renderOrgChart(root: OrgNode = organisation): string {
  return `<div class="org-scroll" role="region" aria-label="Organisation chart" tabindex="0">
    <div class="org-chart"><ul>${node(root)}</ul></div>
  </div>`;
}
