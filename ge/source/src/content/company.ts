import data from "./company.json";

/* The company's own details, kept apart from the profile and the original site (profile.json, site.json) so the startup
   bundle (header, menu, footer, head tags, enquiry form) carries only these; "@/content" re-exports them. */
export const about = data.about;

export const company = {
  name: "Ganesh Electricals",
  tagline: about.tagline,
  // The client-approved corporate introduction (also the footer and home summary).
  summary: about.introduction[0] ?? "",
  introduction: about.introduction[0] ?? "",
  expertise: about.expertise,
  closing: about.closing,
  incorporated: about.incorporated,
  founded: about.founded,
  founderNote: about.note,
  purpose: about.purpose,
  capability: about.capability,
  address: data.contact.address,
  emails: data.contact.emails,
  phone: data.contact.phone,
  phoneHref: data.contact.phoneHref,
  telephone: data.contact.telephone,
  logo: { src: data.logo.file.replace(/^\//, ""), width: data.logo.width, height: data.logo.height, alt: "Ganesh Electricals" },
};

export const newsletter = data.newsletter;
