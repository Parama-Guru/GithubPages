import{a as e,c as t,d as n,h as r,i,l as a,n as o,o as s,r as c,s as l,t as u,u as ee,y as te}from"./chapters-BIQLArqg.js";import{n as d}from"./company-DHEgTaer.js";import{n as ne,r as f}from"./organisation-DovzqRjR.js";import{a as p,c as m,d as h,f as g,i as _,l as v,m as y,n as b,o as re,p as x,r as S,s as C,t as w,u as T}from"./content-BUV7gUsO.js";var E=[120,240],D={welcome:()=>`<div class="flat-extra flat-hero-art">${a()}</div>`,about:()=>`<div class="flat-extra"><ol class="flat-timeline" aria-label="Milestones">${[...x].reverse().map(e=>`<li><strong>${s(e.year)}</strong><span>${s(e.title)}</span><small>${s(e.body)}</small></li>`).join(``)}</ol></div>`,"why-us":()=>`<div class="flat-extra"><ol class="flat-principles" aria-label="${s(y.title)}">${y.principles.map((e,t)=>`<li><span class="mono-label">${u(t+1)}</span><p>${s(e.title)}</p></li>`).join(``)}</ol></div>`,projects:()=>`<div class="flat-extra flat-mosaic"><ul>${T.map((e,n)=>`<li><figure>${t(e,n?`(max-width: 560px) calc(100vw - 48px), (max-width: 999px) calc(66vw - 39px), 500px`:`(max-width: 999px) calc(100vw - 48px), 760px`)}<figcaption>${s(e.label)}</figcaption></figure></li>`).join(``)}</ul></div>`,clients:()=>`<div class="flat-extra flat-marquee"><div class="flat-belt"><ul class="flat-logos" aria-label="Client logos">${b.logos.map(e=>`<li>${t({...e,copies:E.filter(t=>t<e.width)},`116px`)}</li>`).join(``)}</ul></div></div>`,quality:()=>`<div class="flat-extra"><ul class="flat-creds" aria-label="Credentials">${S.map(e=>`<li><strong>${s(e.title)}</strong><p>${s(e.detail)}</p></li>`).join(``)}</ul></div>`,leadership:()=>`<div class="flat-extra flat-leader"><figure class="flat-portrait">${l(C.photo.src,C.photo.width,C.photo.height,C.photo.alt)}</figure>
    <p class="flat-sign">${s(C.name)}<span>${s(C.title)}</span></p></div>`,contact:()=>`<div class="flat-extra flat-contact-art">${n(`sld`,`flat-art flat-art-sld`)}</div>`};function O(e){return D[e]?.()??``}function k(e,t=``){return`<div class="${[`org-box`,t?`org-box-${t}`:e.group?`org-box-${e.group}`:``].filter(Boolean).join(` `)}">${e.name?`<span class="org-name">${s(e.name)}</span><span class="org-role">${s(e.role)}</span>`:`<span class="org-role">${s(e.role)}</span>`}</div>`}function A(e,t=``){let n=e.children??[],r=n.length?`<ul>${n.map(e=>A(e)).join(``)}</ul>`:``;return`<li>${k(e,t)}${r}</li>`}function ie(e=f){let{core:t,teams:n}=ne(e);return`<div class="org-scroll" role="region" aria-label="Organisation chart" tabindex="0">
    <div class="org-chart">
      <section class="org-section org-core" aria-label="Core team"><p class="org-section-label">Core team</p><ul class="org-tree">${A(t)}</ul></section>
      <section class="org-section org-project" aria-label="Project team"><p class="org-section-label">Project team</p>
        <div class="org-teams">${n.map(e=>`<ul class="org-tree">${A(e,`lead`)}</ul>`).join(``)}</div>
      </section>
    </div>
  </div>`}var j=(t,n,i=`text-link`)=>`<a class="${i}" href="${r(t)}">${s(n)}${i===`button`?e:c}</a>`,M=(e,t=``)=>`<ul${t?` class="${t}"`:``}>${e.map(e=>`<li>${s(e)}</li>`).join(``)}</ul>`,N=e=>M(e,`tags`),P=e=>`projects-${e.slug}`,F={"award-alstom":[137,298],"award-danfoss":[211,300],"award-daimler":[318,153],"award-board":[278,208]},I=e=>{let t=e.match(/\d[\d,]*(\.\d+)?/)?.[0].replace(/,/g,``);return t?` data-tally="${t}"`:``};function L(e,t){return`<p class="chapter-label"><span>${u(e)}</span>${s(t)}</p>`}function R(e=!1){return`<dl class="stats${e?` stats-compact`:``}">${y.statistics.map(t=>`<div><dt>${s(e?t.short:t.label)}</dt><dd data-count="${t.value.replace(/,/g,``)}" data-final="${s(t.value)}">${s(t.value)}</dd></div>`).join(``)}</dl>`}function z(){return`<div class="directory">
    <div><p class="mono-label">Visit us</p><p>${s(d.address)}</p></div>
    <div><p class="mono-label">Email</p>${d.emails.map(e=>`<a href="mailto:${e}">${e}</a>`).join(``)}</div>
    <div><p class="mono-label">Telephone</p><a href="${d.phoneHref}">${s(d.phone)}</a></div>
  </div>`}function B(e){return`<ul class="logo-grid">${b.logos.slice(0,e).map(e=>`<li>${l(e.src,e.width,e.height,e.alt)}</li>`).join(``)}</ul>`}function V(){return`<ul class="year-cards">${v.map(e=>`<li><a href="${r(P(e))}"><strong>${s(e.label)}</strong><span>${e.count} projects</span>${c}</a></li>`).join(``)}</ul>`}function H(){return`<div class="cards">${S.map((e,t)=>`<article><span class="mono-label">${u(t+1)}</span><h3>${s(e.title)}</h3><p>${s(e.detail)}</p></article>`).join(``)}</div>`}function U(e,t){let[n,r]=F[e]??[300,300];return`<figure>${l(`media/${e}.webp`,n,r,t)}<figcaption>${s(t)}</figcaption></figure>`}function W(){let e=w.board;return`<div class="awards">${w.awards.map(e=>U(e.image,e.caption)).join(``)}${U(e.image,e.caption)}</div>
    <dl class="figures">${e.figures.map(([e=``,t=``])=>`<div><dd${I(e)}>${s(e)}</dd><dt>${s(t)}</dt></div>`).join(``)}</dl>`}function G(){return`<div class="cards">${re.map(e=>`<article><span class="mono-label">${s(e.voltage||`Electrification`)}</span><h3>${s(e.title)}</h3><p>${s(e.client)}</p></article>`).join(``)}</div>`}var K={welcome:()=>`
    <h1 class="hero-title" data-split><span>Ganesh</span> <span class="title-script">Electricals</span></h1>
    <p class="chapter-lead hero-tagline">${s(d.tagline)}</p>
    ${N(d.expertise)}
    <div class="actions">
      <button class="button" type="button" data-action="enter">Enter the facility${c}</button>
      ${j(`projects`,`Explore projects`)}
      <a class="text-link flat-only" href="${d.phoneHref}">Call ${s(d.phone)}${e}</a>
    </div>`,about:e=>`
    ${L(e,`About`)}
    <h2 class="chapter-title" data-split>Ganesh Electricals</h2>
    <p class="chapter-lead">${s(d.introduction)}</p>
    <ol class="mini-timeline">${m.map(e=>`<li><strong>${e.year}</strong><span>${s(e.title)}</span></li>`).join(``)}</ol>
    <div class="actions">${j(`about`,`About us`)}</div>`,"why-us":e=>`
    ${L(e,`How we serve`)}
    <h2 class="chapter-title" data-split>How we serve</h2>
    <p class="chapter-lead">${s(y.lead)}</p>
    ${R(!0)}
    <div class="actions">${j(`features`,`How we serve our clients`)}</div>`,projects:e=>`
    ${L(e,`Projects`)}
    <h2 class="chapter-title" data-split>Projects</h2>
    <p class="chapter-lead">${s(d.capability)}</p>
    <ul class="year-links">${v.map(e=>`<li><a href="${r(P(e))}">${s(e.label)}</a></li>`).join(``)}</ul>
    <div class="actions">${j(`projects`,`View projects`)}</div>`,clients:e=>`
    ${L(e,`Clients`)}
    <h2 class="chapter-title" data-split>Our Clients</h2>
    <p class="chapter-lead">${s(b.lead)}</p>
    ${B(6)}
    <div class="actions">${j(`clients`,`All clients`)}</div>`,quality:e=>`
    ${L(e,`Quality & Safety`)}
    <h2 class="chapter-title" data-split>Quality &amp; Safety</h2>
    <p class="chapter-lead">${s(g.ehs.intro)}</p>
    ${N([`Quality Policy`,`Quality Standards`,`EHS Policy`,`EHS Standards`])}
    <div class="actions">${j(`quality-safety`,`Quality & Safety`)}</div>`,leadership:e=>`
    ${L(e,`Leadership`)}
    <h2 class="chapter-title" data-split>Leadership</h2>
    <p class="chapter-lead">${s(C.paragraphs[0]??``)}</p>
    <div class="actions">${j(`leadership`,`Leadership`)}${j(`organisation`,`Organisation chart`)}</div>`,contact:e=>`
    ${L(e,`Contact`)}
    <h2 class="chapter-title" data-split>Contact Us</h2>
    ${z()}
    <div class="actions">${j(`contact`,`Send an enquiry`,`button`)}</div>`},q=`<a class="back-link" href="${r(`home`)}" data-back aria-label="Back to the start of the tour">${i}<span>Back</span></a>`,J=e=>e.split(/\s+/).filter(Boolean).map((e,t)=>`<span class="w" style="--w:${Math.min(t,10)}"><span>${s(e)}</span></span>`).join(` `);function ae(){return`<div class="journey" data-journey>
    ${o.map((e,t)=>`<section class="chapter" id="${e.id}" data-chapter="${e.id}" data-zone="${e.zone}" aria-labelledby="${e.id}-title">
          <div class="chapter-panel">${(K[e.id]??(()=>``))(t).replace(/<h([12]) class="([^"]+)"/,`<h$1 id="${e.id}-title" class="$2"`)}</div>
          ${O(e.id)}
          <div class="chapter-poster" aria-hidden="true"><picture><source srcset="data:," media="(scripting: none)"><img src="/GithubPages/ge/posters/${e.id}.webp" width="1280" height="800" alt="" loading="lazy" decoding="async"></picture></div>
        </section>`).join(``)}
    <p class="scroll-cue" aria-hidden="true"><span>Scroll to enter</span><i></i></p>
  </div>`}function Y(e,t,n,r=``,i=``){return`<header class="page-hero">
    ${q}
    ${ee(e)}
    <p class="chapter-label"><span></span>${s(t)}</p>
    <h1 class="page-title">${J(n)}</h1>
    ${r?`<p class="chapter-lead">${s(r)}</p>`:``}
    ${i}
  </header>`}var X=(e,t=``)=>`<section class="sheet ${t}">${e}</section>`,Z=(e,t,n,r=``)=>X(`<p class="chapter-label"><span></span>${s(e)}</p><h2>${s(t)}</h2>${n}`,r);function oe(e){return`<nav class="year-nav" aria-label="Project groups"><ul>${v.map(t=>`<li><a href="${r(P(t))}"${t.slug===e?` aria-current="page"`:``}>${s(t.label)}</a></li>`).join(``)}</ul></nav>`}function Q(e,t,n){return`<div class="table-block">
    <h2>${s(e)}</h2>
    <div class="table-scroll" role="region" aria-label="${s(e)}" tabindex="0">
      <table><thead><tr>${t.map(e=>`<th scope="col">${s(e)}</th>`).join(``)}</tr></thead>
      <tbody>${n.map(e=>`<tr>${e.map((e,n)=>`<td data-label="${s(t[n]??``)}">${s(e)}</td>`).join(``)}</tr>`).join(``)}</tbody></table>
    </div>
  </div>`}function se(e,t,n){return Q(e,n?[`S.No`,`Client name`,`Name of project`,`Location`,`Sector`,`Value`]:[`S.No`,`Client name`,`Name of project`,`Location`],t.map((e,t)=>[String(t+1),e.client,e.project,e.location,...n?[e.sector??``,e.value??``]:[]]))}function ce(){return`<div class="roles">${C.roles.map(e=>`<details><summary><strong>${s(e.title)}</strong><span>${s(e.role)}</span></summary>
        <div class="roles-body"><div><h3>Responsibilities</h3>${M(e.responsibilities)}</div><div><h3>Authorities</h3>${M(e.authorities)}</div></div>
      </details>`).join(``)}</div>`}var $={about:()=>Y(`about`,`About`,d.tagline,d.introduction)+Z(`What we do`,`Our expertise`,M(d.expertise,`expertise`))+X(`<blockquote class="brand-statement"><p>${s(d.closing)}</p></blockquote>`)+X(`<p class="sheet-lead">${s(d.capability)}</p>
      <div class="split-text"><div><h3>Our purpose</h3><p>${s(d.purpose)}</p></div><div><h3>Founded in 1997</h3><p>${s(d.founded)} Incorporated / registered on ${s(d.incorporated)}.</p></div></div>`)+Z(`Since 1997`,`Milestones`,`<ol class="timeline">${x.map(e=>`<li><strong>${e.year}</strong><h3>${s(e.title)}</h3><p>${s(e.body)}</p><time>${e.date}</time></li>`).join(``)}</ol>`)+Z(`Credentials`,`Licence, registration & rating`,H())+Z(`Achievements`,`Recognised on site`,W())+X(`<div class="actions">${j(`features`,`How we serve`)}${j(`execution`,`How we work`)}${j(`organisation`,`Organisation chart`)}${j(`projects`,`Projects`)}</div>`),features:()=>Y(`features`,`How we serve`,y.title,y.lead)+X(`<div class="principles">${y.principles.map((e,t)=>`<article><span class="mono-label">${u(t+1)}</span><h2>${s(e.title)}</h2></article>`).join(``)}</div>`)+X(R())+X(`<p class="sheet-lead">${s(d.capability)}</p><div class="actions">${j(`execution`,`How we work`)}${j(`projects`,`Projects`)}</div>`),execution:()=>Y(`execution`,`How we work`,`How we work`,p.capability)+Z(`Handling local issues`,`Rapport on the ground`,p.localIssues.map(e=>`<p>${s(e)}</p>`).join(``))+Z(`TNEB liaisoning`,`HT service in ${p.tneb.total}`,`<ol class="steps">${p.tneb.steps.map(([e=``,t=``])=>`<li><span>${s(e)}</span><strong>${s(t)}</strong></li>`).join(``)}</ol>
      <p class="steps-total"><span>Total</span><strong>${s(p.tneb.total)}</strong></p>`)+Z(`Manpower deployment`,`${p.manpowerTotal} people per project`,`<dl class="manpower">${p.manpower.map(e=>`<div><dt>${s(e.role)}</dt><dd${I(String(e.count))}>${e.count}</dd></div>`).join(``)}</dl>`)+Z(`Equipment`,`Access equipment on site`,N(p.equipment)),projects:()=>Y(`projects`,`Projects`,`Projects`,d.capability,N(d.expertise))+X(`<dl class="stats">${[{value:String(h.ongoing),label:`On-going projects`},{value:String(h.executed),label:`Projects executed since 2012`},{value:`230`,label:`kV — highest substation voltage`},{value:`1997`,label:`Established`}].map(e=>`<div><dt>${s(e.label)}</dt><dd${/^(19|20)\d\d$/.test(e.value)?``:I(e.value)}>${s(e.value)}</dd></div>`).join(``)}</dl>`)+Z(`Featured`,`Substation & electrification projects`,G())+X(`<ul class="gallery">${T.map((e,n)=>`<li><figure>${t(e,n?`(max-width: 900px) calc(100vw - 48px), (max-width: 1368px) calc(50vw - 35px), 650px`:`(max-width: 1368px) calc(100vw - 48px), 1320px`)}<figcaption>${s(e.label)}</figcaption></figure></li>`).join(``)}</ul>`)+Z(`Project lists`,`On-going and executed projects`,V()),clients:()=>Y(`clients`,`Clients`,`Our Clients`,b.lead)+X(`<h2 class="visually-hidden">Client logos</h2>${B()}`)+Z(`By voltage level`,`Clients by voltage level`,b.byVoltage.map(e=>`<div class="voltage-group"><h3>${s(e.level)}</h3>${M(e.clients,`columns`)}</div>`).join(``))+Z(`International`,`German clients`,M(b.german,`columns`))+Z(`Sectors`,`Industries we serve`,`<div class="cards">${b.sectors.map(e=>`<article><h3>${s(e.sector)}</h3>${M(e.clients)}</article>`).join(``)}</div>`)+Z(`Industrial areas`,`Where we work`,`<div class="cards">${b.areas.map(e=>`<article><h3>${s(e.area)}</h3>${M(e.clients)}</article>`).join(``)}</div>`),"quality-safety":()=>Y(`quality-safety`,`Quality & Safety`,`Quality & Safety`,`Quality Policy · Quality Standards · EHS Policy · EHS Standards`)+X(`<div class="policy"><div><span class="mono-label">01</span><h2>${g.policy.title}</h2></div><div>${g.policy.paragraphs.map(e=>`<p>${s(e)}</p>`).join(``)}<p class="signature">${s(g.policy.signature)}</p></div></div>`)+X(`<div class="policy"><div><span class="mono-label">02</span><h2>${g.standards.title}</h2></div><div>${g.standards.paragraphs.map(e=>`<p>${s(e)}</p>`).join(``)}${g.workStandards.map(e=>`<h3>${s(e.title)}</h3><p>${s(e.body)}</p>`).join(``)}</div></div>`)+X(`<div class="policy"><div><span class="mono-label">03</span><h2>Supplier evaluation</h2></div><div><ol class="commitments">${g.supplierEvaluation.map(e=>`<li>${s(e)}</li>`).join(``)}</ol></div></div>`)+X(`<div class="policy"><div><span class="mono-label">04</span><h2>Site reports</h2></div><div>
      <h3>Weekly report</h3><p>${s(g.weeklyReport.intro)}</p>${M(g.weeklyReport.items,`columns`)}
      <h3>Monthly report</h3><p>${s(g.monthlyReport.intro)}</p>${M(g.monthlyReport.items,`columns`)}</div></div>`)+X(`<div class="policy"><div><span class="mono-label">05</span><h2>Electrical inspections</h2></div><div>${M(g.inspections,`columns`)}</div></div>`)+X(`<div class="policy"><div><span class="mono-label">06</span><h2>EHS Policy</h2></div><div>
      <p>${s(g.ehs.intro)}</p><h3>${s(g.ehs.committed)}</h3>
      <ol class="commitments">${g.ehs.commitments.map(e=>`<li>${s(e)}</li>`).join(``)}</ol>
      <p>${s(g.ehs.closing)}</p><p class="signature">${s(g.ehs.signature)}</p></div></div>`)+Z(`07`,`EHS standards`,`<ol class="ehs-standards">${g.ehsStandards.map(e=>`<li><strong>${s(e.group)}</strong>${e.items.length?M(e.items):``}</li>`).join(``)}</ol>`),leadership:()=>Y(`leadership`,`Leadership`,`Leadership`,`${C.name}, ${C.title}`)+X(`<div class="split">${l(C.photo.src,C.photo.width,C.photo.height,C.photo.alt,`class="photo"`)}
      <div><p class="chapter-label"><span></span>Established in 1997</p>${C.paragraphs.map(e=>`<p>${s(e)}</p>`).join(``)}<p>${s(C.note)}</p>
      <div class="actions">${j(`organisation`,`Organisation chart`)}</div></div></div>`)+X(Q(`Key personnel`,[`Name`,`Designation`,`Education`,`Experience`,`Email`],C.personnel.map(e=>[e.name,e.designation,e.education,e.experience,e.email]))+`<p class="note">${s(C.personnelNote)}</p>`)+Z(`Roles`,`Responsibilities & authorities`,ce()),organisation:()=>Y(`organisation`,`Team`,`Organisation Chart`)+X(ie(),`sheet-chart`),downloads:()=>Y(`downloads`,`Downloads`,`Downloads`,_.intro)+X(`<ul class="documents">${_.documents.map((e,t)=>`<li><span class="mono-label">PDF / ${u(t+1)}</span><h2>${s(e)}</h2><p>Available on request by email.</p>
          <a class="text-link" href="mailto:${d.emails[0]}?subject=${encodeURIComponent(e)}">Request by email${c}</a></li>`).join(``)}</ul><p class="note">${s(_.note)}</p>`),contact:()=>Y(`contact`,`Contact`,`Contact Us`,``,z())+X(`<form class="enquiry" data-enquiry novalidate>
      <h2>Send an enquiry</h2>
      <p class="note">This prepares an email to ${d.emails[0]} in your mail app.</p>
      <div class="fields">
        <label>Your name<input name="name" autocomplete="name" required></label>
        <label>Email address<input name="email" type="email" autocomplete="email" required></label>
        <label>Phone <small>(optional)</small><input name="phone" type="tel" autocomplete="tel"></label>
        <label>Company <small>(optional)</small><input name="company" autocomplete="organization"></label>
        <label class="wide">Tell us about your project<textarea name="message" rows="5" required></textarea></label>
      </div>
      <p class="form-status" role="status" aria-live="polite"></p>
      <button class="button" type="submit">Prepare email${c}</button>
    </form>`),"not-found":()=>Y(`not-found`,`404`,`Page not found`,`This door does not lead anywhere. Every page of the website is listed below.`)+X(`<ul class="year-cards">${te.filter(e=>e.id!==`not-found`&&!e.parent).map(e=>`<li><a href="${r(e.id)}"><strong>${s(e.label)}</strong>${c}</a></li>`).join(``)}</ul>`)};for(let e of v){let t=P(e),n=e.slug===`ongoing`;$[t]=()=>Y(t,`Projects`,n?`On-going projects`:`Projects`,n?`${e.count} projects in progress`:`${e.label} · ${e.count} projects executed`,oe(e.slug))+e.sections.map(e=>X(se(n?e.heading:`Projects ${e.heading}`,e.rows,n))).join(``)}function le(e){if(e===`home`)return ae();let t=$[e];if(!t)throw Error(`No page body for ${e}`);return`<div class="page" data-page="${e}">${t()}</div>`}export{le as renderMain};