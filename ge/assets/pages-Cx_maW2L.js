import{a as e,b as t,c as n,d as r,f as i,g as a,i as ee,l as o,n as s,o as c,r as l,s as u,t as d,u as te}from"./chapters-cvZyvrgB.js";import{n as f}from"./company-VxSqneiV.js";import{n as ne,r as p}from"./organisation-BhrU5xR1.js";import{a as m,c as re,d as h,f as g,i as _,l as v,m as y,n as b,o as ie,p as x,r as S,s as C,t as w,u as T}from"./content-CLIgxFwu.js";var E=[120,240],D={welcome:()=>`<div class="flat-extra flat-hero-art">${te()}</div>`,about:()=>`<div class="flat-extra"><ol class="flat-timeline" aria-label="Milestones">${[...x].reverse().map(e=>`<li><strong>${c(e.year)}</strong><span>${c(e.title)}</span><small>${c(e.body)}</small></li>`).join(``)}</ol></div>`,"why-us":()=>`<div class="flat-extra"><ol class="flat-principles" aria-label="${c(y.title)}">${y.principles.map((e,t)=>`<li><span class="mono-label">${d(t+1)}</span><p>${c(e.title)}</p></li>`).join(``)}</ol></div>`,projects:()=>`<div class="flat-extra flat-mosaic"><ul>${T.map((e,t)=>`<li><figure>${n(e,t?`(max-width: 560px) calc(100vw - 48px), (max-width: 999px) calc(66vw - 39px), 500px`:`(max-width: 999px) calc(100vw - 48px), 760px`)}<figcaption>${c(e.label)}</figcaption></figure></li>`).join(``)}</ul></div>`,clients:()=>`<div class="flat-extra flat-marquee"><div class="flat-belt"><ul class="flat-logos" aria-label="Client logos">${b.logos.map(e=>`<li>${n({...e,copies:E.filter(t=>t<e.width)},`116px`)}</li>`).join(``)}</ul></div></div>`,quality:()=>`<div class="flat-extra"><ul class="flat-creds" aria-label="Credentials">${S.map(e=>`<li><strong>${c(e.title)}</strong><p>${c(e.detail)}</p></li>`).join(``)}</ul></div>`,leadership:()=>`<div class="flat-extra flat-leader"><figure class="flat-portrait">${u(C.photo.src,C.photo.width,C.photo.height,C.photo.alt)}</figure>
    <p class="flat-sign">${c(C.name)}<span>${c(C.title)}</span></p></div>`,contact:()=>`<div class="flat-extra flat-contact-art">${i(`sld`,`flat-art flat-art-sld`)}</div>`};function O(e){return D[e]?.()??``}function k(e,t=``){return`<div class="${[`org-box`,t?`org-box-${t}`:e.group?`org-box-${e.group}`:``].filter(Boolean).join(` `)}">${e.name?`<span class="org-name">${c(e.name)}</span><span class="org-role">${c(e.role)}</span>`:`<span class="org-role">${c(e.role)}</span>`}</div>`}function A(e,t=``){let n=e.children??[],r=n.length?`<ul>${n.map(e=>A(e)).join(``)}</ul>`:``;return`<li>${k(e,t)}${r}</li>`}function ae(e=p){let{core:t,teams:n}=ne(e);return`<div class="org-scroll" role="region" aria-label="Organisation Chart" tabindex="0">
    <div class="org-chart">
      <section class="org-section org-core" aria-label="Core team"><p class="org-section-label">Core team</p><ul class="org-tree">${A(t)}</ul></section>
      <section class="org-section org-project" aria-label="Project team"><p class="org-section-label">Project team</p>
        <div class="org-teams">${n.map(e=>`<ul class="org-tree">${A(e,`lead`)}</ul>`).join(``)}</div>
      </section>
    </div>
  </div>`}var j=(t,n,r=`text-link`)=>`<a class="${r}" href="${a(t)}">${c(n)}${r===`button`?e:l}</a>`,M=(e,t=``)=>`<ul${t?` class="${t}"`:``}>${e.map(e=>`<li>${o(e)}</li>`).join(``)}</ul>`,N=e=>M(e,`tags`),P=e=>`projects-${e.slug}`,F={"award-alstom":[137,298],"award-danfoss":[211,300],"award-daimler":[318,153],"award-board":[278,208]},I=e=>{let t=e.match(/\d[\d,]*(\.\d+)?/)?.[0].replace(/,/g,``);return t?` data-tally="${t}"`:``};function L(e,t){return`<p class="chapter-label"><span>${d(e)}</span>${c(t)}</p>`}function R(e=!1){return`<dl class="stats${e?` stats-compact`:``}">${y.statistics.map(t=>`<div><dt>${o(e?t.short:t.label)}</dt><dd data-count="${t.value.replace(/,/g,``)}" data-final="${c(t.value)}">${c(t.value)}</dd></div>`).join(``)}</dl>`}function z(){return`<div class="directory">
    <div><p class="mono-label">Visit us</p><p>${c(f.address)}</p></div>
    <div><p class="mono-label">Email</p>${f.emails.map(e=>`<a href="mailto:${e}">${e}</a>`).join(``)}</div>
    <div><p class="mono-label">Telephone</p><a href="${f.phoneHref}">${c(f.phone)}</a></div>
  </div>`}function B(e){return`<ul class="logo-grid">${b.logos.slice(0,e).map(e=>`<li>${u(e.src,e.width,e.height,e.alt)}</li>`).join(``)}</ul>`}function V(){return`<ul class="year-cards">${v.map(e=>`<li><a href="${a(P(e))}"><strong>${c(e.label)}</strong><span>${e.count} projects</span>${l}</a></li>`).join(``)}</ul>`}function H(){return`<div class="cards">${S.map((e,t)=>`<article><span class="mono-label">${d(t+1)}</span><h3>${c(e.title)}</h3><p>${c(e.detail)}</p></article>`).join(``)}</div>`}function U(){let e=m.manpower.reduce((e,t)=>t.count>e.count?t:e);return`<dl class="manpower">${m.manpower.map(t=>`<div style="--share:${(t.count/e.count).toFixed(3)}"><dt>${c(t.role)}</dt><dd${I(String(t.count))}>${t.count}</dd></div>`).join(``)}</dl>
    <p class="manpower-scale">Bars compare each team with the largest: ${e.count} ${c(e.role.toLowerCase())}.</p>`}function W(e,t){let[n,r]=F[e]??[300,300];return`<figure>${u(`media/${e}.webp`,n,r,t)}<figcaption>${c(t)}</figcaption></figure>`}function G(){let e=w.board;return`<div class="awards">${w.awards.map(e=>W(e.image,e.caption)).join(``)}${W(e.image,e.caption)}</div>
    <dl class="figures">${e.figures.map(([e=``,t=``])=>`<div><dd${I(e)}>${c(e)}</dd><dt>${c(t)}</dt></div>`).join(``)}</dl>`}function K(){return`<div class="cards">${ie.map(e=>`<article><span class="mono-label">${o(e.voltage||`Electrification`)}</span><h3>${c(e.title)}</h3><p>${c(e.client)}</p></article>`).join(``)}</div>`}var q={welcome:()=>`
    <h1 class="hero-title" data-split><span>Ganesh</span> <span class="title-script">Electricals</span></h1>
    <p class="chapter-lead hero-tagline">${c(f.tagline)}</p>
    ${N(f.expertise)}
    <div class="actions">
      <button class="button" type="button" data-action="enter">Enter the facility${l}</button>
      ${j(`projects`,`Explore projects`)}
      <a class="text-link flat-only" href="${f.phoneHref}">Call ${c(f.phone)}${e}</a>
    </div>`,about:e=>`
    ${L(e,`About`)}
    <h2 class="chapter-title" data-split>Ganesh Electricals</h2>
    <p class="chapter-lead">${c(f.introduction)}</p>
    <ol class="mini-timeline">${re.map(e=>`<li><strong>${e.year}</strong><span>${c(e.title)}</span></li>`).join(``)}</ol>
    <div class="actions">${j(`about`,`About us`)}</div>`,"why-us":e=>`
    ${L(e,`How We Serve`)}
    <h2 class="chapter-title" data-split>How We Serve</h2>
    <p class="chapter-lead">${c(y.lead)}</p>
    ${R(!0)}
    <div class="actions">${j(`features`,`How we serve our clients`)}</div>`,projects:e=>`
    ${L(e,`Projects`)}
    <h2 class="chapter-title" data-split>Projects</h2>
    <p class="chapter-lead">${c(f.capability)}</p>
    <ul class="year-links">${v.map(e=>`<li><a href="${a(P(e))}">${c(e.label)}</a></li>`).join(``)}</ul>
    <div class="actions">${j(`projects`,`View projects`)}</div>`,clients:e=>`
    ${L(e,`Clients`)}
    <h2 class="chapter-title" data-split>Our Clients</h2>
    <p class="chapter-lead">${c(b.lead)}</p>
    ${B(6)}
    <div class="actions">${j(`clients`,`All clients`)}</div>`,quality:e=>`
    ${L(e,`Quality & Safety`)}
    <h2 class="chapter-title" data-split>Quality &amp; Safety</h2>
    <p class="chapter-lead">${c(g.ehs.intro)}</p>
    ${N([`Quality Policy`,`Quality Standards`,`EHS Policy`,`EHS Standards`])}
    <div class="actions">${j(`quality-safety`,`Quality & Safety`)}</div>`,leadership:e=>`
    ${L(e,`Leadership`)}
    <h2 class="chapter-title" data-split>Leadership</h2>
    <p class="chapter-lead">${c(C.paragraphs[0]??``)}</p>
    <div class="actions">${j(`leadership`,`Leadership`)}${j(`organisation`,`Organisation Chart`)}</div>`,contact:e=>`
    ${L(e,`Contact`)}
    <h2 class="chapter-title" data-split>Contact Us</h2>
    ${z()}
    <div class="actions">${j(`contact`,`Send an enquiry`,`button`)}</div>`},oe=`<a class="back-link" href="${a(`home`)}" data-back aria-label="Back to the start of the tour">${ee}<span>Back</span></a>`,se=e=>e.split(/\s+/).filter(Boolean).map((e,t)=>`<span class="w" style="--w:${Math.min(t,10)}"><span>${c(e)}</span></span>`).join(` `);function ce(){return`<div class="journey" data-journey>
    ${s.map((e,t)=>`<section class="chapter" id="${e.id}" data-chapter="${e.id}" data-zone="${e.zone}" aria-labelledby="${e.id}-title">
          <div class="chapter-panel">${(q[e.id]??(()=>``))(t).replace(/<h([12]) class="([^"]+)"/,`<h$1 id="${e.id}-title" class="$2"`)}</div>
          ${O(e.id)}
          <div class="chapter-poster" aria-hidden="true"><picture><source srcset="data:," media="(scripting: none)"><img src="/GithubPages/ge/posters/${e.id}.webp" width="1280" height="800" alt="" loading="lazy" decoding="async"></picture></div>
        </section>`).join(``)}
    <p class="scroll-cue" aria-hidden="true"><span>Scroll to enter</span><i></i></p>
  </div>`}function J(e,t,n,i=``,a=``){return`<header class="page-hero">
    ${oe}
    ${r(e)}
    <p class="chapter-label"><span></span>${c(t)}</p>
    <h1 class="page-title">${se(n)}</h1>
    ${i?`<p class="chapter-lead">${c(i)}</p>`:``}
    ${a}
  </header>`}var Y=(e,t=``)=>`<section class="sheet ${t}">${e}</section>`,X=(e,t,n,r=``)=>Y(`<p class="chapter-label"><span></span>${c(e)}</p><h2>${c(t)}</h2>${n}`,r);function Z(e){return`<nav class="year-nav" aria-label="Project groups"><ul>${v.map(t=>`<li><a href="${a(P(t))}"${t.slug===e?` aria-current="page"`:``}>${c(t.label)}</a></li>`).join(``)}</ul></nav>`}function Q(e,t,n){return`<div class="table-block">
    <h2>${c(e)}</h2>
    <div class="table-scroll" role="region" aria-label="${c(e)}" tabindex="0">
      <table><thead><tr>${t.map(e=>`<th scope="col">${c(e)}</th>`).join(``)}</tr></thead>
      <tbody>${n.map(e=>`<tr>${e.map((e,n)=>`<td data-label="${c(t[n]??``)}">${c(e)}</td>`).join(``)}</tr>`).join(``)}</tbody></table>
    </div>
  </div>`}function le(e,t,n){return Q(e,n?[`S.No`,`Client name`,`Name of project`,`Location`,`Sector`,`Value`]:[`S.No`,`Client name`,`Name of project`,`Location`],t.map((e,t)=>[String(t+1),e.client,e.project,e.location,...n?[e.sector??``,e.value??``]:[]]))}function ue(){return`<div class="roles">${C.roles.map(e=>`<details><summary><strong>${c(e.title)}</strong><span>${c(e.role)}</span></summary>
        <div class="roles-body"><div><h3>Responsibilities</h3>${M(e.responsibilities)}</div><div><h3>Authorities</h3>${M(e.authorities)}</div></div>
      </details>`).join(``)}</div>`}var $={about:()=>J(`about`,`About`,f.tagline,f.introduction)+X(`What we do`,`Our expertise`,M(f.expertise,`expertise`))+Y(`<blockquote class="brand-statement"><p>${c(f.closing)}</p></blockquote>`)+Y(`<p class="sheet-lead">${c(f.capability)}</p>
      <div class="split-text"><div><h3>Our purpose</h3><p>${c(f.purpose)}</p></div><div><h3>Founded in 1997</h3><p>${c(f.founded)} Incorporated / registered on ${c(f.incorporated)}.</p></div></div>`)+X(`Since 1997`,`Milestones`,`<ol class="timeline">${x.map(e=>`<li><strong>${e.year}</strong><h3>${c(e.title)}</h3><p>${c(e.body)}</p><time>${e.date}</time></li>`).join(``)}</ol>`)+X(`Credentials`,`Licence, registration & rating`,H())+X(`Achievements`,`Recognised on site`,G())+Y(`<div class="actions">${j(`features`,`How We Serve`)}${j(`execution`,`How We Work`)}${j(`organisation`,`Organisation Chart`)}${j(`projects`,`Projects`)}</div>`),features:()=>J(`features`,`How We Serve`,y.title,y.lead)+Y(`<div class="principles">${y.principles.map((e,t)=>`<article><span class="mono-label">${d(t+1)}</span><h2>${c(e.title)}</h2></article>`).join(``)}</div>`)+Y(R())+Y(`<p class="sheet-lead">${c(f.capability)}</p><div class="actions">${j(`execution`,`How We Work`)}${j(`projects`,`Projects`)}</div>`),execution:()=>J(`execution`,`How We Work`,`How We Work`,m.capability)+X(`Handling local issues`,`Rapport on the ground`,m.localIssues.map(e=>`<p>${c(e)}</p>`).join(``))+X(`TNEB liaisoning`,`HT service in ${m.tneb.total}`,`<ol class="steps">${m.tneb.steps.map(([e=``,t=``])=>`<li><span>${c(e)}</span><strong>${c(t)}</strong></li>`).join(``)}</ol>
      <p class="steps-total"><span>Total</span><strong>${c(m.tneb.total)}</strong></p>`)+X(`Manpower deployment`,`${m.manpowerTotal} people per project`,U())+X(`Equipment`,`Access equipment on site`,N(m.equipment)),projects:()=>J(`projects`,`Projects`,`Projects`,f.capability,N(f.expertise))+Y(`<dl class="stats">${[{value:String(h.ongoing),label:`On-going projects`},{value:String(h.executed),label:`Projects executed since 2012`},{value:`230`,label:`kV — highest substation voltage`},{value:`1997`,label:`Established`}].map(e=>`<div><dt>${c(e.label)}</dt><dd${/^(19|20)\d\d$/.test(e.value)?``:I(e.value)}>${c(e.value)}</dd></div>`).join(``)}</dl>`)+X(`Featured`,`Substation & electrification projects`,K())+Y(`<ul class="gallery">${T.map((e,t)=>`<li><figure>${n(e,t?`(max-width: 900px) calc(100vw - 48px), (max-width: 1368px) calc(50vw - 35px), 650px`:`(max-width: 1368px) calc(100vw - 48px), 1320px`)}<figcaption>${c(e.label)}</figcaption></figure></li>`).join(``)}</ul>`)+X(`Project lists`,`On-going and executed projects`,V()),clients:()=>J(`clients`,`Clients`,`Our Clients`,b.lead)+Y(`<h2 class="visually-hidden">Client logos</h2>${B()}`)+X(`By voltage level`,`Clients by voltage level`,b.byVoltage.map(e=>`<div class="voltage-group"><h3>${c(e.level)}</h3>${M(e.clients,`columns`)}</div>`).join(``))+X(`International`,`German clients`,M(b.german,`columns`))+X(`Sectors`,`Industries we serve`,`<div class="cards">${b.sectors.map(e=>`<article><h3>${c(e.sector)}</h3>${M(e.clients)}</article>`).join(``)}</div>`)+X(`Industrial areas`,`Where we work`,`<div class="cards">${b.areas.map(e=>`<article><h3>${c(e.area)}</h3>${M(e.clients)}</article>`).join(``)}</div>`),"quality-safety":()=>J(`quality-safety`,`Quality & Safety`,`Quality & Safety`,`Quality Policy · Quality Standards · EHS Policy · EHS Standards`)+Y(`<div class="policy"><div><span class="mono-label">01</span><h2>${g.policy.title}</h2></div><div>${g.policy.paragraphs.map(e=>`<p>${c(e)}</p>`).join(``)}<p class="signature">${c(g.policy.signature)}</p></div></div>`)+Y(`<div class="policy"><div><span class="mono-label">02</span><h2>${g.standards.title}</h2></div><div>${g.standards.paragraphs.map(e=>`<p>${c(e)}</p>`).join(``)}${g.workStandards.map(e=>`<h3>${c(e.title)}</h3><p>${c(e.body)}</p>`).join(``)}</div></div>`)+Y(`<div class="policy"><div><span class="mono-label">03</span><h2>Supplier evaluation</h2></div><div><ol class="commitments">${g.supplierEvaluation.map(e=>`<li>${c(e)}</li>`).join(``)}</ol></div></div>`)+Y(`<div class="policy"><div><span class="mono-label">04</span><h2>Site reports</h2></div><div>
      <h3>Weekly report</h3><p>${c(g.weeklyReport.intro)}</p>${M(g.weeklyReport.items,`columns`)}
      <h3>Monthly report</h3><p>${c(g.monthlyReport.intro)}</p>${M(g.monthlyReport.items,`columns`)}</div></div>`)+Y(`<div class="policy"><div><span class="mono-label">05</span><h2>Electrical inspections</h2></div><div>${M(g.inspections,`columns`)}</div></div>`)+Y(`<div class="policy"><div><span class="mono-label">06</span><h2>EHS Policy</h2></div><div>
      <p>${c(g.ehs.intro)}</p><h3>${c(g.ehs.committed)}</h3>
      <ol class="commitments">${g.ehs.commitments.map(e=>`<li>${c(e)}</li>`).join(``)}</ol>
      <p>${c(g.ehs.closing)}</p><p class="signature">${c(g.ehs.signature)}</p></div></div>`)+X(`07`,`EHS standards`,`<ol class="ehs-standards">${g.ehsStandards.map(e=>`<li><strong>${c(e.group)}</strong>${e.items.length?M(e.items):``}</li>`).join(``)}</ol>`),leadership:()=>J(`leadership`,`Leadership`,`Leadership`,`${C.name}, ${C.title}`)+Y(`<div class="split">${u(C.photo.src,C.photo.width,C.photo.height,C.photo.alt,`class="photo"`)}
      <div><p class="chapter-label"><span></span>Established in 1997</p>${C.paragraphs.map(e=>`<p>${c(e)}</p>`).join(``)}<p>${c(C.note)}</p>
      <div class="actions">${j(`organisation`,`Organisation Chart`)}</div></div></div>`)+Y(Q(`Key personnel`,[`Name`,`Designation`,`Education`,`Experience`,`Email`],C.personnel.map(e=>[e.name,e.designation,e.education,e.experience,e.email]))+`<p class="note">${c(C.personnelNote)}</p>`)+X(`Roles`,`Responsibilities & authorities`,ue()),organisation:()=>J(`organisation`,`Team`,`Organisation Chart`)+Y(ae(),`sheet-chart`),downloads:()=>J(`downloads`,`Downloads`,`Downloads`,_.intro)+Y(`<ul class="documents">${_.documents.map((e,t)=>`<li><span class="mono-label">PDF / ${d(t+1)}</span><h2>${c(e)}</h2><p>Available on request by email.</p>
          <a class="text-link" href="mailto:${f.emails[0]}?subject=${encodeURIComponent(e)}">Request by email${l}</a></li>`).join(``)}</ul><p class="note">${c(_.note)}</p>`),contact:()=>J(`contact`,`Contact`,`Contact Us`,``,z())+Y(`<form class="enquiry" data-enquiry novalidate>
      <h2>Send an enquiry</h2>
      <p class="note">This prepares an email to ${f.emails[0]} in your mail app.</p>
      <div class="fields">
        <label>Your name<input name="name" autocomplete="name" required></label>
        <label>Email address<input name="email" type="email" autocomplete="email" required></label>
        <label>Phone <small>(optional)</small><input name="phone" type="tel" autocomplete="tel"></label>
        <label>Company <small>(optional)</small><input name="company" autocomplete="organization"></label>
        <label class="wide">Tell us about your project<textarea name="message" rows="5" required></textarea></label>
      </div>
      <p class="form-status" role="status" aria-live="polite"></p>
      <button class="button" type="submit">Prepare email${l}</button>
    </form>`),"not-found":()=>J(`not-found`,`404`,`Page not found`,`This door does not lead anywhere. Every page of the website is listed below.`)+Y(`<ul class="year-cards">${t.filter(e=>e.id!==`not-found`&&!e.parent).map(e=>`<li><a href="${a(e.id)}"><strong>${c(e.label)}</strong>${l}</a></li>`).join(``)}</ul>`)};for(let e of v){let t=P(e),n=e.slug===`ongoing`;$[t]=()=>J(t,`Projects`,n?`On-going Projects`:`Projects`,n?`${e.count} projects in progress`:`${e.label} · ${e.count} projects executed`,Z(e.slug))+e.sections.map(e=>Y(le(n?e.heading:`Projects ${e.heading}`,e.rows,n))).join(``)}function de(e){if(e===`home`)return ce();let t=$[e];if(!t)throw Error(`No page body for ${e}`);return`<div class="page" data-page="${e}">${t()}</div>`}export{de as renderMain};