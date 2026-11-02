import { organisation, orgSections, type OrgNode } from "@/content/organisation";
import { esc } from "./html";

function box(entry: OrgNode, kind = ""): string {
  const className = ["org-box", kind ? `org-box-${kind}` : entry.group ? `org-box-${entry.group}` : ""].filter(Boolean).join(" ");
  const label = entry.name ? `<span class="org-name">${esc(entry.name)}</span><span class="org-role">${esc(entry.role)}</span>` : `<span class="org-role">${esc(entry.role)}</span>`;
  return `<div class="${className}">${label}</div>`;
}

function node(entry: OrgNode, kind = ""): string {
  const children = entry.children ?? [];
  const list = children.length ? `<ul>${children.map((child) => node(child)).join("")}</ul>` : "";
  return `<li>${box(entry, kind)}${list}</li>`;
}

export function renderOrgChart(root: OrgNode = organisation): string {
  const { core, teams } = orgSections(root);
  return `<div class="org-scroll" role="region" aria-label="Organisation chart" tabindex="0">
    <div class="org-chart">
      <section class="org-section org-core" aria-label="Core team"><p class="org-section-label">Core team</p><ul class="org-tree">${node(core)}</ul></section>
      <section class="org-section org-project" aria-label="Project team"><p class="org-section-label">Project team</p>
        <div class="org-teams">${teams.map((lead) => `<ul class="org-tree">${node(lead, "lead")}</ul>`).join("")}</div>
      </section>
    </div>
  </div>`;
}
