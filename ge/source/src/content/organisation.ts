export type OrgNode = { name?: string; role: string; group?: string; children?: OrgNode[] };

const crew = (supervisors: string, technicians: string, electricians: string): OrgNode => ({
  role: `Supervisors (${supervisors})`,
  children: [{ role: `Technicians (${technicians})`, children: [{ role: `Electricians (${electricians})`, children: [{ role: "Helpers (10 Nos)" }] }] }],
});

export const organisation: OrgNode = {
  name: "Mr.B.Kumareson",
  role: "Proprietor",
  children: [
    { name: "Mr.C.Jagan", role: "Liasioning TNEB" },
    { name: "Mr.G.Saravanan", role: "Liasioning CEIG" },
    { name: "Mr.S.Krishnan", role: "Technical Manager" },
    { name: "Mr.P.Pravinkumar", role: "Design Engineer", children: [{ role: "Draftsman (2 Nos)" }] },
    { name: "Mr.K.Senthil", role: "Quality" },
    { name: "Mr.R.Sethuraman", role: "Head Business Development" },
    { name: "Mr.Mahaveer", role: "Head Finance" },
    {
      name: "Mr.B.Muthukumar",
      role: "Head Projects/Technical",
      children: [
        {
          role: "Factory Team",
          group: "team",
          children: [{ role: "Quality Engineer" }, { role: "Site Engineer Factory", children: [{ role: "Safety Engineer" }, crew("3 Nos", "4 Nos", "5 Nos")] }],
        },
        {
          role: "Office Team",
          group: "team",
          children: [
            { role: "Site Engineer Office", children: [{ role: "Safety Engineer" }, crew("1 Nos", "2 Nos", "5 Nos")] },
            { role: "Project Control", children: [{ role: "Documentation & Drawing" }] },
            { role: "Fab. Engineer", children: [{ role: "Welders (3 Nos)", children: [{ role: "Helpers (10 Nos)" }] }] },
          ],
        },
      ],
    },
    { name: "Mr.N.Ganeshan", role: "Procurement", children: [{ role: "Contract" }, { role: "Logistics" }] },
    {
      name: "Mr.D.Prabhu",
      role: "Head Civil",
      children: [{ role: "Civil Engineer", children: [{ role: "Civil Supervisor", children: [{ role: "Labour (25 Nos)" }] }] }],
    },
    {
      name: "Mr.S.Sivaraman",
      role: "Administration",
      children: [
        { role: "Human Resources", children: [{ role: "Environment Staff" }] },
        { role: "Accounting & Taxes" },
        { role: "Store Keeper", children: [{ role: "Stores Asst." }] },
      ],
    },
  ],
};

export function countNodes(node: OrgNode): number {
  return 1 + (node.children ?? []).reduce((sum, child) => sum + countNodes(child), 0);
}

export function depth(node: OrgNode): number {
  return 1 + Math.max(0, ...(node.children ?? []).map(depth));
}

// As in the company profile: heads with their own teams are drawn again below the core team.
export const leadsTeam = (node: OrgNode) => (node.children?.length ?? 0) > 1 || depth(node) > 2;

export function orgSections(root: OrgNode = organisation) {
  const heads = root.children ?? [];
  return {
    core: { ...root, children: heads.map((head) => (leadsTeam(head) ? { name: head.name, role: head.role, group: "lead" } : head)) },
    teams: heads.filter(leadsTeam),
  };
}
