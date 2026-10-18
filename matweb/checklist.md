# GenZ Matrimony — research, plan and checklist

Status: **phase 1 published for client review on 18 Oct 2026** — landing page,
log-in and the full sign-up wizard run on a browser-only demo backend (see
Part E). The owner approved publishing this client preview to GitHub Pages;
the live landing, root index link, log-in and sign-up routes are verified.
Phase 2 (real database integration) remains pending client approval.

This document describes **GenZ Matrimony** (`genzmatrimony.com`), a **fast,
animated 2D matrimony web application** (not a 3D site). Real contact details and
real member data are supplied later by the owner; until then every name,
profile and photo in the build is synthetic.

How to read the checklist: every `[ ]` item has a description of exactly what
"done" means. An item is ticked only after it is shown working on localhost in
the browser. Items are never reworded to make them pass.

---

## Part A — Research findings

### A0. Method

- Popularity was checked first (web search + Similarweb), then the leading
  sites were opened **live** with Playwright 1.64 in a real Microsoft Edge
  window at **desktop 1440×900** and **phone 390×844 (iPhone 13 profile)**.
  Each page was scrolled top to bottom with a screenshot per screen, and the
  headings, navigation, buttons, form fields, dropdown options, fonts, colours,
  request count, transfer size and Largest Contentful Paint were extracted.
- Interactions exercised: Bharat "Profile created for" dropdown, Shaadi quick
  search dropdowns (religion, mother tongue) and "Let's Begin", Jeevansathi
  "Register for Free", Jeevansathi public Tamil browse page (brides/grooms list,
  filters) at both sizes. **No account was created and no form was submitted.**
- Headless Chromium was blocked ("Access Denied") by BharatMatrimony,
  TamilMatrimony and Jodii, so all final captures used a headed Edge window.
- Pages behind login (full registration wizard, matches, inbox, chat, settings)
  cannot be inspected without an account. Those findings come from the sites'
  own help/policy pages and published guides and are marked *(secondary)*.
- Screenshots and raw captures are kept in the local session workspace, not in
  this repository.

### A1. Which sites are most popular

| Rank | Site | Evidence |
|---|---|---|
| 1 | **shaadi.com** | Similarweb, India › Dating & Relationships, Oct 2026: **#1** |
| 2 | **bharatmatrimony.com** (Matrimony.com group, 300+ community portals) | Market-share articles 2026 rank it #1–2 by share; filed under a different Similarweb category |
| 3 | **jeevansathi.com** (Info Edge) | Consistently the third national player; fastest-growing per 2026 articles |
| — | **tamilmatrimony.com** (Matrimony.com group) | Similarweb India › Dating & Relationships: **#5** — the strongest regional portal |
| — | **Jodii / BharatJodii** (Matrimony.com group) | Mass-market, vernacular, app-first |
| — | **m4marry.com** | South-Indian regional (Malayalam, Tamil, Telugu, Kannada) |
| ✗ | betterhalf.ai | Web app discontinued — the domain now redirects to a Google Play search page; excluded |

Market-share percentages quoted by blogs disagree (Bharat ~40 %, Shaadi
~30–35 %, Jeevansathi 10–20 %); treat them as indicative only. All articles agree
that **90 %+ of usage is on phones**, which drives the mobile-first decision
below.

Sources: similarweb.com/top-websites/india/community-and-society/romance-and-relationships/,
eface.in (Top 15 matrimonial websites 2026), andwemet.com blog (2026),
smarther.co (Top 10 matrimonial apps).

### A2. Site-by-site observations (live)

#### shaadi.com — "quick search in the hero"

- Header: logo · About us · Help · Login (dropdown). No main nav.
- Hero: full-bleed couple photograph, headline **"Choose Your Forever"**,
  sub-line "Find love on your terms with millions of verified profiles", and a
  dark **quick-search strip**: *I'm looking for a* [Woman/Man] · *aged* [22] to
  [27] · *of religion* [Select] · *and mother tongue* [Select] · **Let's Begin**.
- Religion options (live): Hindu, Muslim, Christian, Sikh, Parsi, Jain,
  Buddhist, Jewish, No Religion, Spiritual, Other.
- Mother tongue dropdown is grouped: **Frequently used** (Hindi, Marathi,
  Punjabi, Bengali, Gujarati, Urdu, Telugu, Kannada, English, Tamil, Oriya,
  Marwari) then **More** (A–Z, 50+ languages). Good pattern for long lists.
- "Let's Begin" opens a **Register for Free** modal: country code + mobile →
  **Get OTP**, or **Google**, or **Email**. The quick-search answers are carried
  forward (the search is really a registration funnel).
- Below: trust strip (#1 Matchmaking Service · Play Store rating by 2.4 lakh
  users · 80 lakh success stories — site claims), three feature cards (30-day
  money-back guarantee · Blue Tick verification · AI matchmaking), VIP
  matchmaking banner, founder quote, success-story cards, numbered FAQ.
- Phone: the four quick-search fields become a 2×2 grid with a full-width
  button; the photo stays behind.
- Type: Roboto, hero 78 px / 600. Colours: red logo, teal CTA, purple VIP.
- Weight: 144 requests, ≥ 2.1 MB desktop, LCP 1.6 s desktop / 0.5 s phone.
- Weak points: custom `div` dropdowns, CEO block adds weight, nothing is
  browsable without registering.

#### bharatmatrimony.com / tamilmatrimony.com — "registration card first"

(Identical template; TamilMatrimony only changes copy to "…for Tamils!".)

- Top strip of **community links** (Assamese, Bengali, … Tamil, Telugu, Urdu).
- Header: logo "From Matrimony.com Group" · Already a member? **LOGIN** · Help.
  On scroll a **Register Free** button joins the sticky header.
- Hero: left headline "The **biggest and most trusted** matrimony service for
  Indians!" with a 26-years collage; right a **Create a Matrimony Profile**
  card: *Profile created for* · *Enter the name* · [+91] *Enter Mobile Number*
  ("OTP will be sent to this number") · **REGISTER FREE →** · T&C line.
- "Profile created for" options (live): **Myself, Daughter, Son, Sister,
  Brother, Relative, Friend**. Picking one reveals **Male / Female** radios.
- Country codes list India first, then the big NRI destinations (USA, UAE, UK,
  Australia, Singapore, Canada, Qatar, Kuwait, Oman, Bahrain…).
- Trust row: 100 % mobile-verified profiles · 4 crore+ customers · 26 years.
- Then: **Assisted Service** (relationship manager), **Elite Matrimony**,
  **Retail outlet** (offline store finder), app download, success stories, footer.
- Phone: the registration card fills the first screen — fastest route to sign-up.
- Type: Lato, hero 32 px / 800. Colours: green + orange, CTA rgb(224,101,6).
- Weight: 160–167 requests, ≥ 1.6–1.9 MB, LCP 0.3–0.7 s (fastest of the set).
- Weak points: blocks automated/assistive browsers behind a bot wall; long page
  of upsells; no photo of real people in the hero.

#### jeevansathi.com — "clear navigation + browsable profiles" (primary reference)

- Header: logo · **Browse Profiles By ▾** · **Search ▾** · Help · Login ·
  **Register for Free**. The only site with a real navigation bar.
- Hero: photograph, serif headline "Finding your perfect match just became
  easier", "Discover from lakhs of verified profiles", **Register Now**.
- Sections: 25 years · 100 % screened profiles · **Control over privacy** · app
  download · **Match Hour** (online community events) · **Video profiles** ·
  **3 steps** (Define partner preferences → Browse profiles → Send interests &
  connect) · **Membership: Free vs Paid** comparison · Premier (assisted) ·
  success stories with marriage dates · browse by community/city · footer.
- Free vs Paid (live): Free = browse profiles, shortlist & send interest. Paid
  adds = message & chat, 3× more matches daily, advanced search, view contact
  details.
- Registration opens a page with **Continue with Mobile Number / Google / Email**.
- **Public browse page** (`/matrimonials/tamil-matrimonial/`): Brides / Grooms
  tabs, profile cards, right-hand filter rail (Gender, Religion, Occupation,
  Caste), "View 2284 more". Photos are blurred for logged-out visitors.
  - Desktop card: photo · profile ID · *age, height | religion / mother tongue |
    caste | gothra | education | income | occupation | city*.
  - Phone row: square thumbnail + *age, religion: caste | mother tongue, city |
    occupation | education*; sticky **Filter** button; floating **Register Free**
    pill.
- Privacy (official privacy-features page): profile visible to **all
  visitors / only registered users who pass my filters / nobody**; photos
  visible to **all members / only members I contact or accept**; **contact
  filters** stop people outside your partner criteria from contacting you.
- Type: Lexend body + serif display. CTA rose rgb(230,49,87).
- Weight: 141–203 requests, ≥ 3.2–4.1 MB, LCP 0.9–1.2 s.

#### Jodii (BharatJodii) — "vernacular, for common people"

- On load a **coach-mark dims the whole page** pointing at the language
  switcher ("Click to change display language" · Got it). Clear idea, heavy
  execution — it blocks the hero.
- Hero: wedding photograph + card "A matchmaking app for common people",
  trusted by 10 lakh+ families, Google Play button.
- Stats (site claims): 10 lakh+ users · 3 lakh+ marriages · 2 lakh+ verified ·
  4.2★ (43K reviews). Why: affordable plans · safe & private · **multiple
  languages**. Match categories such as "own house, Govt jobs". 3 steps,
  FAQ. Phone sign-up form: Name, Mobile → 4-digit OTP boxes.
- Type: Poppins. Weight: 83 requests, ≥ 1.9–2.0 MB, LCP 1.0–1.3 s.

#### m4marry.com — "families find each other"

- Language links (Malayalam, Tamil, Kannada, Telugu) + language selector
  (English, Malayalam, Tamil, Telugu, Kannada). Tagline "Where families find
  each other".
- Hero form on a red photo: Name · Create Profile For · **Mother Tongue** ·
  [+91] Mobile · T&C checkbox · **Register Free**; reCAPTCHA; **search by
  Profile ID**. A chat assistant bubble overlaps the hero on load.
- Extras: Virtual Family Meet, Shorts (video), community profile links.
- Weight: heaviest — 125–168 requests, ≥ 5.6–5.8 MB, LCP 1.7–2.7 s.

### A3. Landing page anatomy — what every leader does

| Block (top → bottom) | Shaadi | Bharat/Tamil | Jeevansathi | Jodii | M4marry |
|---|---|---|---|---|---|
| Language / community switch | — | community strip | browse menu | language coach-mark | language strip + selector |
| Header actions | Login | Login · Help | Nav · Login · Register | Help phone · Play · language | Language · 24/7 · Login |
| Hero form | quick search (4 fields) | register card (3 fields) | button only | app CTA | register card (4 fields) |
| Phone OTP sign-up | ✓ | ✓ | ✓ | ✓ | ✓ |
| Google / Email sign-up | ✓ | — | ✓ | — | — |
| Trust numbers | ✓ | ✓ | ✓ | ✓ | ✓ |
| Verification promise | Blue Tick | mobile-verified | screened / Govt-ID | verified | — |
| How it works (3 steps) | — | — | ✓ | ✓ | — |
| Free vs paid plans | FAQ | upsell blocks | ✓ table | "affordable" | premium blocks |
| Assisted / elite service | VIP | Assisted + Elite | Premier | — | Royale |
| Success stories | ✓ | ✓ | ✓ with dates | ✓ | ✓ |
| FAQ | ✓ | — | — | ✓ | — |
| Browse by community/city | — | footer | ✓ | ✓ | ✓ |
| App download | — | ✓ | ✓ | ✓ | ✓ |

Conclusions: the **sign-up step is above the fold** on every site; **mobile OTP**
is the universal first step; **"profile created for"** (self or family) and
**mother tongue / religion** are asked first because matching is community-led;
trust and privacy are the main selling points; pages are long upsell scrolls.

### A4. What details are asked (registration + profile data model)

Live-verified items are marked ●; others are *(secondary)* from help pages and
guides (support.shaadi.com, blog.shaadi.com, jeevansathi.com/privacy-features,
weddingbiodatabuilder.in matrimony formats) and are common to all leaders.

| Group | Field | Notes |
|---|---|---|
| Account | Profile created for ● | Myself, Son, Daughter, Brother, Sister, Relative, Friend |
| | Gender ● | Inferred for son/daughter/brother/sister, asked otherwise |
| | Name ● | Display name can be hidden; show initials / profile ID |
| | Mobile + country code ● | OTP; India first, then NRI countries |
| | Email / Google ● | Optional alternative sign-in |
| Basics | Date of birth | Minimum legal marriage age: 21 (men), 18 (women) |
| | Mother tongue ● | Frequently-used group first, then A–Z |
| | Religion ● | 11 options incl. No Religion, Spiritual |
| | Caste / community, sub-caste | Depends on religion; "Caste no bar"; "Willing to marry outside my community" |
| | Gothram / gotra ● | Shown on cards for Hindu profiles; optional |
| | Marital status | Never married, Divorced, Widowed, Awaiting divorce; children & who they live with |
| | Height ● | ft-in with cm |
| Horoscope (optional) | Star (nakshatra, 27), Raasi (12), Dosham (Chevvai / Rahu-Ketu / None / Don't know), time & place of birth, horoscope upload | Essential for Tamil/Hindu families; 10-porutham match |
| Location | Country, state, city ●, residency / citizenship, native place | NRI support |
| Education & career | Highest education ●, college, employed in (Govt/PSU, Private, Business, Self-employed, Defence, Not working), occupation ●, organisation, annual income range ● | Income visibility toggle |
| Family | Family type (joint/nuclear), status (middle / upper-middle / rich / affluent), values (orthodox / traditional / moderate / liberal), father's & mother's occupation, brothers/sisters (married/unmarried), family location | |
| Lifestyle | Diet (veg / non-veg / eggetarian / vegan), smoking, drinking, physical status, body type | |
| About | About me (minimum length, prompt suggestions), hobbies & interests | |
| Photos | Up to N photos, crop, **privacy: all members / only accepted / on request** ● | Uploading photos optional (Jeevansathi policy) |
| Partner preferences | Age range, height range, marital status, religion/caste (multi + no bar), mother tongue, education, occupation, income, location, star / dosham, diet | Each can be **strict** (filters who can contact me ●) or **flexible** |
| Verification | Mobile ✓ ●, email ✓, government-ID / selfie badge ● (Blue Tick / Govt-ID verified) | Real ID checks need a backend; demo only in phase 1 |

Deliberately **excluded**: skin tone / complexion and weight (colourism and body
shaming; owner may override). Caste is asked but never required, and "no bar"
is first-class.

### A5. Features after login (secondary, consistent across sites)

1. **Home / dashboard** — profile completeness, daily recommendations, new
   matches, who viewed me, pending interests.
2. **Matches** — tabs: New, Daily picks, Mutual (both match each other's
   preferences), Near me, Recently viewed.
3. **Search** — basic (age, religion, mother tongue, location), advanced
   (everything in A4), **search by profile ID ●**, saved searches.
4. **Profile view** — photo gallery, key facts, "about", family, career,
   horoscope, **"how you match"** checklist against my preferences, actions:
   send interest, shortlist, chat, view contact (paid), ignore, block, report.
5. **Inbox / interests** — received, sent, accepted, declined; requests for
   photo, horoscope, contact.
6. **Chat** — after mutual acceptance (or paid).
7. **Shortlist**, **notifications**, **profile visitors**.
8. **My profile** — edit by section, photos & privacy, horoscope, verification.
9. **Partner preferences**, **privacy settings** (profile / photo / contact
   visibility ●), notification settings, hide / delete profile.
10. **Membership** — free vs paid comparison ●, checkout, assisted service.
11. **Safety** — safety tips, report & block, verification badges.

### A6. Trust, safety and legal (to be confirmed with counsel)

- Show a **grievance officer** with contact details (IT Rules) and a plain
  privacy notice; collect **itemised consent** for photos and sensitive data
  such as religion, caste and horoscope; let users access, correct and erase
  their data and withdraw consent (DPDP Act 2023 / DPDP Rules 2025).
- MeitY's advisory to matrimonial websites expects users to declare that their
  information is true, platforms to verify identity, and photos to be protected
  against misuse.
- Enforce the minimum marriage age at date-of-birth entry.
- Phase 1 stores only synthetic data, so none of the real-data obligations are
  triggered yet; they become blocking before any real launch.

### A7. Measured performance (live, Oct 2026)

| Site | Requests | Transfer (≥) | LCP desktop / phone |
|---|---|---|---|
| Shaadi | 144 | 1.7–2.1 MB | 1.6 s / 0.5 s |
| Bharat | 160–167 | 1.6–1.7 MB | 0.7 s / 0.3 s |
| Tamil | 154–161 | 1.9 MB | 0.4 s / 0.4 s |
| Jeevansathi | 141–203 | 3.2–4.1 MB | 1.2 s / 0.9 s |
| Jodii | 83 | 1.9–2.0 MB | 1.3 s / 1.0 s |
| M4marry | 125–168 | 5.6–5.8 MB | 2.7 s / 1.7 s |

Transfer is summed from `content-length` headers, so it is a lower bound. LCP
was measured on a fast office connection, not a throttled phone. Our budget
(B3) targets **≤ 30 requests and ≤ 400 KB** for the landing page, roughly
4–15× lighter than every competitor.

### A8. What we take, and what we avoid

| Take (and why) | Avoid (and why) |
|---|---|
| Bharat/Tamil: registration card above the fold; "profile created for" first | Bot walls that also block assistive tech |
| Shaadi: quick search that flows into sign-up; grouped "frequently used" lists | Custom `div` dropdowns without keyboard / screen-reader support |
| Jeevansathi: real navigation, browsable public profiles, free-vs-paid table, three-level privacy, contact filters | 4 MB pages, 200 requests |
| Jeevansathi: phone list rows + sticky Filter + floating Register pill | Blurred-photo teasers that feel like a paywall |
| Jodii / M4marry: language switch in the header (English + Tamil first) | Full-page dimming coach-marks and chat pop-ups covering the hero |
| All: phone OTP, trust numbers, success stories, FAQ | Long upsell scrolls (VIP, Elite, retail, founder quote) on the landing page |
| Tamil sites: star, raasi, dosham, gothram fields; 10-porutham matching | Complexion/weight fields; mandatory caste |

---

## Part B — Decisions, architecture and stack

### B1. Assumptions (made in autopilot — confirm in D0)

1. **Audience**: Indian families and individuals, phone-first, with English and
   **Tamil** as the first two interface languages (more later).
2. **Phase 1 = working front-end application with demo data.** GitHub Pages is
   static, so there is no real backend: sign-up uses a clearly labelled demo OTP,
   and profiles, interests and chats persist in the browser (IndexedDB). All
   data access goes through one typed repository interface so a real backend can
   replace the demo adapter in phase 2 without UI changes.
3. **No real people.** Demo profiles are generated (fictional names, illustrated
   avatars). Any marketing photography must be licensed and recorded in C6.
4. **Brand**: **GenZ Matrimony**, domain **genzmatrimony.com** (owner, 18 Oct
   2026). Logo mark: two overlapping hearts (violet + coral) designed in SVG.
5. **Delivery**: a static folder published at `/GithubPages/matweb/` now, and
   the same build at `genzmatrimony.com` later (hash routing + relative `base`,
   so no rebuild is needed for the domain). Opening `index.html` from
   `file://` is not supported for the multi-route app (ES modules); an optional
   single-file demo build can be added if required (D0).

### B2. Stack (stable versions checked on npm, 2026-10-18)

Pre-release `latest` tags were rejected: react-hook-form 8.0.0-beta → **7.89.0**;
@playwright/test 1.65.0-alpha → **1.64.0**. Phase 1 additionally uses
**@hookform/resolvers 5.9.1**, **@axe-core/playwright 4.13.0** and
**fake-indexeddb 6.2.5** (unit tests). `@tanstack/react-virtual` and
`vite-plugin-pwa` join in later phases when matches and offline mode are built.

| Purpose | Choice | Why |
|---|---|---|
| Language | **TypeScript 7.0** (strict) | Typed profile model, forms and repository |
| Build | **Vite 8.3** + **@vitejs/plugin-react 6.1** | Fast dev, code-splitting per route, static output, relative `base` |
| UI | **React 19.3** | Component model for a real multi-screen app |
| Routing | **React Router 8.4** (hash routing) | Deep links work on static GitHub Pages without server rewrites |
| Styling | **Tailwind CSS 4.3** via `@tailwindcss/vite` | Compile-time CSS, design tokens as CSS variables |
| Animation | **Motion 14.1** (`motion/react`, `LazyMotion` + `domAnimation`) on lazily loaded screens; **CSS keyframes** for everything above the fold | Spring/layout/exit animations where they matter, zero motion runtime in the first bundle |
| Forms | **React Hook Form 7.89** + **Zod 4.6** | Fast multi-step wizard, one schema for validation and types |
| Data | **@tanstack/react-query 5.104** | Caching, optimistic interest/shortlist updates, same API for demo and real backend |
| Long lists | **@tanstack/react-virtual 3.14** | Smooth scrolling through hundreds of matches on low-end phones |
| Demo storage | **Dexie 4.4** (IndexedDB) | Persistent demo profiles, interests, chats |
| Icons | **lucide-react 1.55** (tree-shaken) | Consistent, accessible icons |
| i18n | **i18next 26.4** + **react-i18next 17.0** | English + Tamil, lazy-loaded language bundles |
| Offline / install | **vite-plugin-pwa 2.0** | Service worker, manifest, offline shell |
| Fonts | **@fontsource-variable/bricolage-grotesque 5.3** (display), **@fontsource-variable/plus-jakarta-sans 5.3** (UI), **@fontsource-variable/noto-sans-tamil 5.3** (all OFL-1.1), unicode-range subsets | No external font requests; Tamil glyphs download only when Tamil text is shown |
| Unit tests | **Vitest 5.0** | Schemas, porutham calculator, match scoring, repository |
| Browser tests | **@playwright/test 1.64.0** | Flows, viewports, offline, reduced motion, accessibility |

Rejected: Next.js (server features unused on Pages); Three.js/WebGL (not needed,
costs speed); GSAP (Motion covers UI motion with less weight); component kits
like MUI (weight, generic look); Firebase/Supabase in phase 1 (needs owner
approval, cost and legal review — candidate for phase 2).

### B3. Performance budget (hard gates)

| Metric | Target (mobile, Lighthouse "Slow 4G", mid-range phone) |
|---|---|
| Landing page JS | ≤ 120 KB gzip |
| Each lazy route chunk | ≤ 50 KB gzip |
| Landing total transfer | ≤ 400 KB incl. fonts and hero art |
| Requests on landing | ≤ 30 |
| LCP | ≤ 1.8 s |
| INP | ≤ 150 ms |
| CLS | ≤ 0.05 |
| Lighthouse Performance / Accessibility / Best Practices | ≥ 95 / 100 / 100 |
| Match list scroll | 60 fps with 500 profiles (virtualised) |

---

## Part C — The experience

### C1. Design direction — "Gen Z, warm and safe" (revised 18 Oct 2026)

The owner asked for a new, Gen Z pattern with the app name **GenZ Matrimony**.
A second, short research round replaced the first draft (kolam/teal/serif).

**Reference research (live, Playwright, desktop 1440×900 + phone):**

| Site | What we saw | Idea taken |
|---|---|---|
| **hinge.co** | Full-bleed photo, serif headline "The dating app designed to be deleted", black buttons, very little UI | One confident promise in the headline; calm, uncluttered hero |
| **bumble.com** | Butter-yellow field, giant wordmark with tilted photo cards fanned through it, pill navigation, globe language picker | Tilted, floating profile cards; pill-shaped nav and language switch |
| **aisle.co** (Indian, intent-led) | "Nothing *casual* about this dating app.", plum accent word, phone mock-ups | A coloured accent word in the headline; show the product, not stock photos |
| 2026 Gen Z colour/UI write-ups (accio.com, colorpick.app, techyheaven.com) | Digital lavender, electric violet, coral, butter yellow; expressive grotesques such as Bricolage Grotesque; soft UI, aurora gradients | Palette family and display font |

Matrimony incumbents (A2) are red, orange and rose with stock wedding photos.
GenZ Matrimony deliberately uses **violet + coral + butter on lavender-white**,
illustrated (faceless) avatars and product-style cards, so it reads as a modern
app rather than another matrimony portal.

- **Concept — "Both say yes."** Two hearts overlap in the logo; on the landing
  page an interest heart travels along a dashed path from one profile card to
  the other and an "It's mutual!" bubble pops. Hearts rise softly through
  every hero, panel and CTA band (background animation the owner requested).
- **Palette** (semantic roles, WCAG contrast measured):

  | Role | Token | Hex | Contrast |
  |---|---|---|---|
  | Page | `cloud` | `#FAF7FF` | — |
  | Text | `ink` | `#1E1232` | 16.7:1 on cloud |
  | Secondary text | `muted` | `#5B4E70` | 7.2:1 on cloud |
  | Placeholder / tertiary | `subtle` | `#776A8C` | 5.0:1 on white |
  | Primary (buttons, links, focus) | `violet` | `#6B2EE0` | white on it 6.8:1; on cloud 6.4:1 |
  | Accent (hearts, highlights) | `coral` | `#FF5D73` | ink on it 6.0:1 (never white text) |
  | Coral text | `coral-text` | `#C42645` | 5.3:1 on cloud |
  | Highlight (marker, badges) | `butter` | `#FFD84D` | ink on it 12.8:1 |
  | Success | `jade-text` | `#08765A` | 5.3:1 on cloud |
  | Danger | `danger` | `#C8243F` | 5.6:1 on white |
  | Tints | `lav-50…400`, `coral-soft`, `butter-soft`, `jade-soft` | — | backgrounds only |

- **Type**: display **Bricolage Grotesque** (expressive, Gen Z), interface
  **Plus Jakarta Sans**, Tamil **Noto Sans Tamil** — self-hosted variable fonts,
  no negative letter-spacing; Tamil headings get their own smaller sizes.
- **Pattern**: a dot lattice with small coral and lavender hearts (SVG data
  URI, about 1 KB), faded with a mask behind heroes; drifting aurora blobs.
- **Every control is custom** and shares one "control surface" (rounded 16 px,
  lavender border, violet focus ring): searchable dropdown/combobox with
  grouped options, multi-select with chips, choice chips and cards, segmented
  switch with sliding thumb, heart toggle switch, animated checkbox, two-thumb
  range slider, 6-box OTP, date-of-birth and time pickers, stepper counter,
  phone input with country picker, drag-and-zoom photo cropper.
- **Layout**: landing is a scrolling story (hero + sign-up card → marquee →
  quick search → how it works → bento features → promises → stories carousel →
  plans → FAQ → CTA → footer). Auth pages are a split screen (violet brand panel
  with live step list + form). The logged-in app shell (bottom tabs on phones,
  rail on desktop) arrives with matches in phase 3.
- **Differences from prior work in this repository** (Ganesh Electricals 3D
  site): light lavender theme instead of dark; 2D CSS/SVG motion instead of
  WebGL; a form-first application instead of a scroll-driven camera journey;
  bilingual interface; illustrated avatars instead of photography.

### C2. Information architecture

Public (no login):

| Route | Purpose |
|---|---|
| `/` | Landing: header (logo · language EN/த · Login), hero with kolam animation + **register card** (profile for · name · mobile → OTP), quick search, trust numbers, how it works (3 steps), free vs paid, success stories, FAQ, footer |
| `/login` | Mobile OTP (demo), email option |
| `/register/*` | Multi-step wizard (C3) |
| `/browse/:community` | Public browse list with filters; locked details until sign-in (no blurred photos — illustrated placeholders instead) |
| `/plans` | Free vs paid comparison (demo checkout) |
| `/stories` | Success stories (synthetic until real ones are supplied) |
| `/help`, `/safety`, `/privacy`, `/terms`, `/grievance` | Help, safety tips, policies, grievance officer |

Logged in:

| Route | Purpose |
|---|---|
| `/home` | Completeness meter, daily picks (swipe stack), new matches, visitors, pending interests |
| `/matches/:tab` | New · Daily · Mutual · Near me · Recently viewed — virtualised list |
| `/search` | Basic + advanced filters, by profile ID, saved searches |
| `/profile/:id` | Full profile, "how you match", horoscope / porutham, actions |
| `/inbox/:tab` | Received · Sent · Accepted · Declined · Requests |
| `/chat/:id` | Conversation (after mutual acceptance) |
| `/shortlist`, `/notifications` | Saved profiles, alerts |
| `/me/*` | Edit profile sections, photos & privacy, horoscope, verification |
| `/preferences` | Partner preferences with strict / flexible switches |
| `/settings/*` | Privacy (profile / photo / contact), notifications, language, hide / delete, download my data |

### C3. Registration wizard (one topic per screen, progress shown)

1. **Who is this profile for?** — large choice chips (Myself, Son, Daughter,
   Brother, Sister, Relative, Friend) → gender inferred or asked.
2. **Name and mobile** — country code (India first), demo OTP, terms + truth
   declaration.
3. **Basics** — date of birth (age check), mother tongue (frequently used
   first), religion, community (searchable, "no bar"), marital status, height.
4. **Horoscope** (skippable) — star, raasi, dosham, birth time and place.
5. **Location** — country, state, city, residency.
6. **Education and work** — education, employed in, occupation, income (with a
   "hide income" switch).
7. **Family** — type, status, values, parents' occupations, siblings.
8. **About and lifestyle** — about me (with prompt chips), diet, habits.
9. **Photos** — upload, crop, privacy choice (default: only members I accept).
10. **Partner preferences** — sensible defaults from your own answers, strict /
    flexible per field.
11. **Done** — completeness ring animates to the final percentage; first
    matches appear.

Progress autosaves after every step; Back never loses answers; the wizard
works with the keyboard alone.

### C4. Motion storyboard (2D, purposeful, reduced-motion safe)

| Moment | Motion | Why it matters |
|---|---|---|
| Background (heroes, auth panel, promises, CTA) | Hearts in four colours rise and drift with slight rotation; aurora blobs breathe; paused off-screen ✅ | The "love" atmosphere the owner asked for, at near-zero CPU cost (compositor-only CSS) |
| Landing hero | Headline, copy and sign-up card rise in sequence; two tilted profile cards drop in and float; a heart travels along a dashed path between them; "It's mutual!" pops with a spring ✅ | Tells the product story ("both say yes") in one glance, no video |
| Marquee | Tilted violet ribbon of promises scrolls; pauses on hover ✅ | Energy and scannable trust points |
| Counters | "0 / 100% / 3 / 1" promises count up when scrolled into view ✅ | Makes the promises feel concrete |
| Dropdowns, menu | Popover pops from its trigger (up or down); phone menu slides in from the right ✅ | Feels native and responsive |
| Segmented / switches | Thumb slides with a spring; switch knob shows a heart when on; checkbox tick draws itself ✅ | Every control feels hand-made |
| Wizard | Steps slide left/right by direction; progress bar and ring fill; step list ticks ✅ | Shows forward motion and progress |
| OTP | Six boxes auto-advance; paste fills all; demo code taps to fill ✅ | Familiar and fast |
| Done | Hearts burst outward; profile-strength ring fills to the final percentage ✅ | Celebrates finishing |
| Daily picks | Card stack: swipe or tap ✓ / ✕; next card rises | Quick triage on phones (phase 3) |
| Card → profile | Shared-element transition (photo and name fly to the header) | Keeps context (phase 3) |
| Send interest | A coral heart flies from your card to theirs; the button morphs into "Interest sent" | Clear, celebratory feedback (phase 3) |
| Porutham | Ten poruthams reveal one by one with ✓ / ✕ and a total | Makes horoscope matching readable (phase 3) |

With `prefers-reduced-motion`, rising hearts become a still scatter, entrance
animations are skipped and end states are shown immediately (verified ✅).

### C5. Demo data

- 500+ synthetic profiles generated from seed lists (names, cities, education,
  occupations, communities, stars), balanced across genders, religions,
  languages and ages 21–45, with fixed seeds so tests are repeatable.
- Avatars: illustrated SVG portraits / initials generated in code (no real
  faces).
- A banner on every page reads "Demo — no real members".

### C6. Assets and licences

- Fonts: Bricolage Grotesque, Plus Jakarta Sans, Noto Sans Tamil — SIL Open
  Font License 1.1 (self-hosted via Fontsource).
- Icons: Lucide — ISC licence.
- Logo, heart lattice, aurora, illustrated avatars and favicon: made in code
  for this project.
- Testimonials on the landing page are **sample stories** and labelled as such
  until real couples give written consent.
- Any photography: licensed source and attribution recorded here before use.

---

## Part D — Checklist

### D0. Approval gates

- [ ] **Research accepted.** Owner confirms Part A covers the sites and details
      they wanted (Shaadi, Bharat/Tamil, Jeevansathi, Jodii, M4marry).
- [ ] **Assumptions accepted.** Owner confirms B1 (audience and languages,
      phase-1 demo backend, no real people, delivery) or gives changes, which
      are written into B1 first.
- [ ] **Stack accepted.** Owner confirms B2.
- [ ] **Direction accepted.** Owner approves the revised C1 (Gen Z palette,
      hearts, custom controls) and the motion storyboard C4.
- [ ] **Field list accepted.** Owner confirms A4, including the exclusions
      (complexion, weight) and caste being optional.
- [ ] **Brand supplied or placeholder approved.** Name, logo, contact and
      grievance-officer details, or written approval to keep placeholders.
- [ ] **Source location agreed.** Where the editable source lives (a local,
      git-ignored workspace or another repository) and that only the built
      static files are copied into `GithubPages/matweb/`.

### D1. Project setup

- [x] **Vite + React + TypeScript** project with strict mode, ESLint, Prettier
      and relative `base`. Done = `npm run dev` shows the shell and `npm run
      build` outputs static files.
- [x] **Dependencies pinned** to B2 versions; no pre-releases. Done =
      `package.json` reviewed against B2.
- [ ] **Tailwind 4 tokens**: C1 colours, type scale, spacing, radii and motion
      durations as CSS variables. Done = a token preview page shows every token.
- [x] **Local fonts** with Latin + Tamil subsets and `font-display: swap`.
      Done = Network panel shows no font requests leaving the site.
- [ ] **Folder layout**: `src/app` (shell, routes), `src/features/*`
      (auth, register, matches, search, profile, inbox, chat, settings, plans),
      `src/data` (models, repository, demo adapter, seed), `src/ui`
      (components), `src/i18n`, `src/motion`. Done = folders exist with an
      index file each.
- [x] **`.gitignore`** excludes `node_modules`, build output, test reports and
      caches. Done = `git status` clean after a build.

### D2. Data layer

- [x] **Profile model + Zod schemas** for every A4 field. Done = unit tests
      reject invalid ages, heights and missing required fields.
- [ ] **Repository interface** (`auth`, `profiles`, `search`, `interests`,
      `shortlist`, `chat`, `settings`, `plans`). Done = the UI imports only the
      interface; no component touches Dexie directly.
- [x] **Demo adapter on Dexie** with versioned schema and a "reset demo"
      action. Done = data survives reload; reset restores the seed.
- [ ] **Seed generator** (C5) with fixed seed. Done = the same 500 profiles on
      every machine; distribution test passes.
- [ ] **Match scoring**: preference fit as a percentage plus the per-field
      reasons. Done = unit tests for strict vs flexible fields.
- [ ] **Porutham calculator** (10 poruthams from star and raasi). Done = unit
      tests against a published reference table for at least 10 star pairs.
- [ ] **Privacy rules enforced in the repository** (profile / photo / contact
      visibility, contact filters, block). Done = tests show blocked or
      filtered users cannot view or contact.

### D3. App shell, navigation and i18n

- [ ] **Responsive shell**: bottom tabs < 768 px, left rail ≥ 1024 px, sticky
      header with language switch. Done = screenshots at 360, 390, 768, 1024,
      1440 px with no overlap.
- [x] **Hash routes** for all of C2 with lazy loading. Done = every route
      deep-links and reloads correctly on static hosting.
- [x] **English + Tamil** strings for every screen, with the language
      remembered. Done = switching language changes every visible string; no
      untranslated keys in tests.
- [x] **Demo banner** on every page. Done = visible and announced by screen
      readers.

### D4. Public pages

- [ ] **Landing** per C2 and A8, with the kolam hero and register card above
      the fold on a 360×640 phone. Done = Lighthouse mobile meets B3.
- [x] **Quick search → sign-up** carries answers into the wizard. Done =
      Playwright test.
- [ ] **Public browse** with filters and locked details. Done = phone and
      desktop layouts match A2 learnings without blurred photos.
- [ ] **Plans** free-vs-paid table and demo checkout. Done = upgrading unlocks
      paid features in demo.
- [ ] **Stories, FAQ, help, safety, privacy, terms, grievance** pages. Done =
      content approved by owner; the grievance page shows owner-supplied details.

### D5. Authentication and registration

- [x] **Login / sign-up** with mobile + demo OTP (six boxes, auto-advance,
      resend timer) and an email option. Done = keyboard-only test passes.
- [x] **Wizard C3** with autosave, Back, progress and per-step validation.
      Done = refresh in the middle of any step resumes at the same step.
- [x] **Age gate**: 21+ for men, 18+ for women. Done = unit and browser tests.
- [x] **Searchable selects** for long lists (community, city, education,
      occupation) with "frequently used" groups. Done = screen-reader and
      keyboard test.
- [ ] **Photo upload** with crop, compression to WebP ≤ 200 KB, and privacy
      choice. Done = stored in IndexedDB; privacy honoured on other profiles.
- [ ] **Consent and truth declaration** recorded with a timestamp. Done =
      visible in settings and in "download my data".

### D6. Logged-in features

- [ ] **Home dashboard** with completeness meter, daily picks swipe stack,
      visitors and pending interests. Done = swipe, tap and keyboard all work.
- [ ] **Matches tabs** with a virtualised list. Done = 500 profiles scroll at
      60 fps on a throttled phone profile.
- [ ] **Search** basic + advanced + profile ID + saved searches. Done = every
      A4 filter tested.
- [ ] **Profile view** with sections, "how you match", porutham, and actions
      (interest, shortlist, chat, contact, ignore, block, report). Done = each
      action updates the other user's demo inbox.
- [ ] **Inbox** received / sent / accepted / declined / requests with
      optimistic updates. Done = state is correct after reload.
- [ ] **Chat** after acceptance, with demo auto-replies. Done = messages
      persist; blocked users cannot message.
- [ ] **Shortlist and notifications**. Done = counts update live in the tab bar.
- [ ] **My profile, preferences, privacy, notifications, hide / delete,
      download my data**. Done = each setting changes behaviour, verified by test.
- [ ] **Verification badges** (mobile ✓ real in demo; ID / selfie demo flow
      clearly labelled). Done = badge rules unit-tested.

### D7. Motion

- [ ] **Motion tokens** (durations, easings) and `LazyMotion`. Done = motion
      code within the B3 budget.
- [ ] **Every C4 moment implemented.** Done = screen recording of each moment
      reviewed against C4.
- [x] **Reduced motion** variant for every moment. Done = Playwright run with
      `reducedMotion: 'reduce'` shows the same end states.
- [ ] **View Transitions** with fallback. Done = works in Chromium; no errors
      in Firefox and WebKit.

### D8. Accessibility

- [ ] **WCAG 2.2 AA**: contrast, focus order, visible focus, 44×44 px touch
      targets, labels, error messages linked to fields. Done = axe reports 0
      violations on every route.
- [ ] **Screen reader pass** (NVDA + Chrome, VoiceOver + Safari) on landing,
      wizard, matches, profile and chat. Done = notes recorded, issues fixed.
- [ ] **Swipe alternatives**: every gesture has a button. Done = keyboard-only
      test covers daily picks.

### D9. Performance and offline

- [ ] **B3 budget enforced in CI** (bundle size check + Lighthouse CI). Done =
      a build that breaks the budget fails.
- [ ] **PWA**: manifest, icons, offline shell, "update available" prompt.
      Done = installable; app opens offline after the first visit.
- [ ] **Images**: WebP / AVIF, explicit sizes, lazy below the fold. Done = CLS
      ≤ 0.05.

### D10. Verification and publishing

- [ ] **Unit tests** (schemas, scoring, porutham, privacy, repository) pass.
- [ ] **Playwright flows** at 360×640, 390×844, 768×1024, 1440×900: register,
      search, send interest, accept, chat, settings, language switch,
      reduced motion, offline. Done = all green with no console errors.
- [ ] **No overlap**: screenshots at every size checked for horizontal
      overflow and control collisions, including long Tamil strings.
- [x] **Static subdirectory test**: built folder served under
      `/GithubPages/matweb/` locally. Done = deep links and reloads work.
- [x] **Root index card** added to `GithubPages/index.html` and a row to
      `GithubPages/README.md` with an accurate title. Done = only after owner
      approval.
- [x] **Commit and push only when the owner says so.** Done = staged list
      contains only `matweb/` files plus the approved shared files; live URL
      verified in the browser after deployment.
      ✅ Vite 8.3 + React 19.3 + TS 7.0 strict, Prettier (ESLint dropped: TS strict + Prettier cover it). `npm run dev` / `npm run build` work.
      ✅ exact versions in package.json, no pre-releases.
      ✅ verified: zero external hosts requested in English and Tamil.
      ✅ `git status --ignored` shows dist, node_modules, test-results ignored.
      ✅ schemas for every wizard step; 19 unit tests incl. age, height, missing fields.
      ✅ versioned Dexie DB; survives reload (tested). "Reset demo" action still to add.
      ✅ /, /login, /signup?step=…, /app, /legal/:doc, 404 — deep links verified on the published copy.
      ✅ typed dictionaries (missing Tamil key = compile error); switch tested in e2e; choice remembered.
      ✅ role=note on every page.
      ✅ answers seed partner preferences.
      ✅ 6-box OTP, paste, resend timer, attempts/lock/expiry; keyboard-only e2e passes.
      ✅ autosave per step, Back, progress rail/bar; reload mid-wizard resumes (e2e).
      ✅ unit + browser tests.
      ✅ custom combobox, grouped options, keyboard + axe tested.
      ✅ Playwright reducedMotion run shows static end states (landing + wizard).

---

## Part E — Build log (phase 1: landing, log-in, sign-up)

**Built 18 Oct 2026.** Source retained locally in `matweb/source/` (React + Vite)
and ignored by the static publishing repository; the verified
build is copied to `matweb/` (`index.html`, `assets/`, `favicon.svg`) by
`npm run publish:local`, tracked in `.published.json`.

### E1. What exists

| Area | Contents |
|---|---|
| Landing `#/` | Header (nav, EN/தமிழ், log in, join), hero with sign-up card + animated profile cards, promise marquee, quick search, how it works, bento features (live photo-privacy toggle), count-up promises, testimonial carousel (6 sample stories, autoplay/pause/arrows/dots/swipe), plans, FAQ accordion, CTA band, footer, phone menu drawer |
| Log in `#/login` | Mobile or email → demo OTP → home; unknown number offers sign-up |
| Sign up `#/signup` | 10 steps: who · verify (OTP) · basics · horoscope · location · career · family · about · photos (upload + crop + privacy) · partner → done (heart burst + strength ring) |
| Home `#/app` | Greeting, profile strength, profile summary, resume prompt, coming-next list, log out |
| Legal `#/legal/…` | Privacy, terms, grievance (drafts), safety tips; 404 page |
| Data | `Backend` interface (`src/data/repository.ts`) + browser demo adapter (Dexie). **Phase 2 replaces only `src/data/api.ts`'s adapter with the real database client.** |

### E2. Verification (all passing)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| `npm run test:unit` | 19 / 19 (schemas, age gate, phone, consent, OTP lock/expiry/rate-limit, progress never moves back) |
| `npm run test:e2e` | 16 / 16 on desktop 1440×900 and Pixel 7: landing + Tamil, keyboard select, hero hand-off, axe (no serious/critical issues on 4 routes), reduced motion, full sign-up → log out → log in, unknown-number log-in, keyboard-only sign-up/log-in |
| Horizontal overflow | 0 px at 1440 and 412 wide, English and Tamil |
| Console errors | none on any route |
| External requests | none (fonts self-hosted) |
| Published copy | `/`, `#/login`, `#/signup`, `#/legal/privacy`, 404 render from `matweb/` served under `/GithubPages/matweb/` |
| First-load JS (B3 ≤ 120 KB gzip) | **119.0 KB** (React DOM, router, i18n, hero); motion runtime, below-fold sections, auth, wizard, demo DB and Tamil strings load on demand |

### E3. Not yet (next phases)

- Phase 2 — **database integration**: real OTP (SMS/email), accounts, profiles,
  photo storage; remove the demo banner and on-screen codes.
- Lighthouse run against B3 (LCP/INP/CLS) on throttled mobile.
- "Reset demo" action, consent shown in settings, photo privacy enforced on
  other users' views, public browse, plans checkout.
- Phase 3 — matches, search, profile view, interests, chat, settings (D6).
- Client approval of the published preview before starting integration.

### Client-preview publication — 18 Oct 2026

- Published release: `586d0e3` in `Parama-Guru/GithubPages`, pushed to `main`.
- Live preview: https://parama-guru.github.io/GithubPages/matweb/
- Root index card and README listing added; browser navigation from the live
  index to the landing page verified.
- Production build, 19 unit tests and 16 desktop/mobile browser tests passed.
- Copied release matches the build; entry assets exist. Public response is
  HTTP 200 with the expected build entry.
- Live log-in and sign-up routes render; no page errors or failed requests
  observed during route checks. Mobile landing at 412 px has no horizontal overflow.
- Development source stays local and ignored; no dependencies, caches or
  test reports included. Existing shared skill/instruction changes remain local.
- This release is a browser-only demo, not a live matchmaking service.
  Database, real OTP and custom-domain configuration remain deferred.

### E4. Commands

```
cd matweb/source
npm install
npm run dev            # http://127.0.0.1:5180
npm run build          # type-check + production build to dist/
npm run serve          # dist/ at http://127.0.0.1:4180/GithubPages/matweb/
npm run test:unit
npm run test:e2e       # builds must be current; starts serve automatically
npm run publish:local  # copy dist/ into matweb/
```
