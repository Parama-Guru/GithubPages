export type OrgNode = { name?: string; role: string; children?: OrgNode[] };

export const organisation: OrgNode = {
  name: "Mr.B.Kumareson",
  role: "Founder/CEO",
  children: [
    {
      name: "Mr. Vijaysaradhi",
      role: "Technical",
      children: [
        { name: "Mr.Mothilal", role: "Design Engineer" },
        { name: "Mr.Senthil", role: "QA" },
      ],
    },
    {
      name: "Mr. Muthukumar",
      role: "Projects",
      children: [
        {
          role: "Project Coordinator",
          children: [
            {
              role: "Site Engineer",
              children: [
                { role: "Safety Engineer" },
                { role: "Supervisors (3)", children: [{ role: "Technicians (4)", children: [{ role: "Electricians (5)" }] }] },
              ],
            },
            { role: "Fab Engineer", children: [{ role: "Welders (3)", children: [{ role: "Helpers (10)" }] }] },
            { role: "Project Control", children: [{ role: "Documentaion/Drawing" }] },
            { role: "Quality Engineer" },
          ],
        },
        { role: "Account Supervisor" },
      ],
    },
    {
      name: "Mr. Elumalai",
      role: "Procurement",
      children: [{ role: "Contract" }, { role: "Logistics" }],
    },
    {
      role: "Liasioning",
      children: [
        { name: "Mr. Anandnarayan", role: "Liasioning TNEB" },
        { name: "Mr. Saravanan", role: "Liasioning CEIG" },
      ],
    },
    { name: "Mr. Subash", role: "Civil" },
  ],
};

export function countNodes(node: OrgNode): number {
  return 1 + (node.children ?? []).reduce((sum, child) => sum + countNodes(child), 0);
}
