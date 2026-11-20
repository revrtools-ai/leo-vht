/* Léo VHT — planche contact infinie, index, expositions, contact */
(() => {
  const S = window.SITE, P = window.PROJECTS, IM = window.IMAGES;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = (n) => String(n).padStart(2, "0");
  const nm = (slug, i) => `${slug}-${pad(i)}`;
  const src = (n, big) => `img/${n}${big ? "" : "-s"}.webp`;
  const ratio = (n) => { const d = IM[n]; return d ? d[0] / d[1] : 1.5; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mod = (a, n) => ((a % n) + n) % n;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouse = matchMedia("(hover: hover) and (pointer: fine)");
  const wide = matchMedia("(min-width: 900px)");
  const bySlug = Object.fromEntries(P.map((p, i) => [p.slug, { ...p, n: i + 1 }]));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const imgTag = (n, alt, cls = "", sizes = "(min-width: 900px) 50vw, 100vw", extra = "") => {
    const [w, h] = IM[n] || [1800, 1200];
    return `<img class="${cls}" src="${src(n)}" srcset="${src(n)} 900w, ${src(n, true)} 1800w" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}" loading="lazy" decoding="async" ${extra}>`;
  };
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  /* ——————————————————— Planche contact infinie ——————————————————— */
  const stage = $("#stage"), cap = $("#cap"), coords = $("#coords");
  const SKIP = new Set(["psg-04"]);
  const picks = (() => {
    const sets = P.map((p) => {
      const mid = Math.ceil(p.images / 2) + 1;
      return [p.tile, p.cover, mid, p.images, 2]
        .filter((v, i, a) => v >= 1 && v <= p.images && a.indexOf(v) === i && !SKIP.has(nm(p.slug, v)))
        .slice(0, 3);
    });
    const out = [];
    for (let r = 0; r < 3; r++) P.forEach((p, k) => { if (sets[k][r]) out.push({ p, i: sets[k][r] }); });
    return out;
  })();

  const C = { x: 0, y: 0, vx: 0, vy: 0, W: 1, H: 1, m: 0, items: [], drift: 0, idle: 0, hov: null, running: true };
  let built = false;

  function build() {
    const vw = innerWidth, vh = innerHeight;
    const cw = vw < 700 ? 150 : clamp(vw / 5.4, 230, 340);
    const ch = cw * 1.18;
    const cols = Math.max(5, Math.ceil(vw / cw) + 2);
    const rows = Math.max(5, Math.ceil(vh / ch) + 2);
    C.W = cols * cw; C.H = rows * ch; C.m = cw;
    const rand = rng(11);
    stage.textContent = "";
    C.items = [];
    let k = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++, k++) {
        const pk = picks[(k + r * 5) % picks.length];
        const name = nm(pk.p.slug, pk.i);
        const ra = ratio(name);
        let w = ra > 1.15 ? cw * (0.6 + rand() * 0.32) : ra < 0.87 ? cw * (0.4 + rand() * 0.22) : cw * (0.5 + rand() * 0.2);
        let h = w / ra;
        if (h > ch * 0.9) { h = ch * 0.9; w = h * ra; }
        const bx = c * cw + (cw - w) * rand();
        const by = r * ch + (ch - h) * rand();
        const f = 0.78 + 0.42 * (w / cw);           // les grandes photos bougent plus vite : profondeur
        const a = document.createElement("a");
        a.className = "ph";
        a.href = `#/p/${pk.p.slug}`;
        a.tabIndex = -1;
        a.draggable = false;
        a.dataset.slug = pk.p.slug;
        a.dataset.i = pk.i;
        a.style.cssText = `width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;z-index:${Math.round(f * 100)}`;
        const img = new Image();
        img.alt = `${pk.p.title}, photo ${pk.i}`;
        img.decoding = "async";
        img.draggable = false;
        img.onload = () => setTimeout(() => img.classList.add("ok"), built ? 0 : 120 + rand() * 900);
        img.src = src(name);
        a.appendChild(img);
        stage.appendChild(a);
        C.items.push({ el: a, bx, by, f });
      }
    }
    built = true;
    place();
  }

  function place() {
    for (const it of C.items) {
      const x = mod(it.bx + C.x * it.f + C.m, C.W) - C.m;
      const y = mod(it.by + C.y * it.f + C.m, C.H) - C.m;
      it.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    }
    const fx = Math.round(-C.x), fy = Math.round(-C.y);
    const t = `X ${fx < 0 ? "−" : "+"}${String(Math.abs(fx)).padStart(4, "0")} · Y ${fy < 0 ? "−" : "+"}${String(Math.abs(fy)).padStart(4, "0")}`;
    if (coords.textContent !== t) coords.textContent = t;
  }

  const drag = { on: false, moved: false, sx: 0, sy: 0, lx: 0, ly: 0, lt: 0 };
  function tick() {
    if (C.running) {
      if (!drag.on) {
        C.x += C.vx; C.y += C.vy;
        C.vx *= 0.94; C.vy *= 0.94;
        C.idle++;
        const want = !reduce && !C.hov && C.idle > 150 ? 1 : 0;
        C.drift += (want - C.drift) * 0.02;
        C.x -= 0.32 * C.drift; C.y -= 0.16 * C.drift;
      }
      place();
    }
    requestAnimationFrame(tick);
  }

  function wake() { C.idle = 0; document.body.classList.add("touched"); }

  stage.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    Object.assign(drag, { on: true, moved: false, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, lt: performance.now() });
    C.vx = C.vy = 0;
    wake();
  });
  addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse" && !drag.on) moveCap(e);
    if (!drag.on) return;
    const dx = e.clientX - drag.lx, dy = e.clientY - drag.ly;
    const now = performance.now(), dt = Math.max(8, now - drag.lt);
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) {
      drag.moved = true;
      stage.classList.add("grab");
      unhover();
    }
    if (drag.moved) {
      C.x += dx; C.y += dy;
      C.vx = (dx / dt) * 16; C.vy = (dy / dt) * 16;
    }
    drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = now;
    wake();
  });
  const release = () => {
    if (!drag.on) return;
    drag.on = false;
    stage.classList.remove("grab");
    if (performance.now() - drag.lt > 90) { C.vx = C.vy = 0; }
    C.vx = clamp(C.vx, -60, 60); C.vy = clamp(C.vy, -60, 60);
  };
  addEventListener("pointerup", release);
  addEventListener("pointercancel", release);
  stage.addEventListener("click", (e) => { if (drag.moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  stage.addEventListener("wheel", (e) => {
    e.preventDefault();
    const k = e.deltaMode === 1 ? 30 : 1;
    C.x -= e.deltaX * k * 0.9; C.y -= e.deltaY * k * 0.9;
    wake(); unhover();
  }, { passive: false });
  stage.addEventListener("dragstart", (e) => e.preventDefault());

  // Survol : les autres photos passent en noir et blanc, une étiquette suit le curseur
  stage.addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse" || drag.moved && drag.on) return;
    const a = e.target.closest(".ph");
    if (!a || a === C.hov) return;
    unhover();
    C.hov = a;
    a.classList.add("hov");
    stage.classList.add("dim");
    const p = bySlug[a.dataset.slug];
    cap.querySelector("b").textContent = p.title;
    cap.querySelector("span").textContent = `${pad(+a.dataset.i)} / ${pad(p.images)}`;
    cap.classList.add("on");
    moveCap(e);
  });
  stage.addEventListener("pointerout", (e) => {
    if (C.hov && !C.hov.contains(e.relatedTarget)) unhover();
  });
  function unhover() {
    if (!C.hov) return;
    C.hov.classList.remove("hov");
    C.hov = null;
    stage.classList.remove("dim");
    cap.classList.remove("on");
  }
  function moveCap(e) {
    if (!cap.classList.contains("on")) return;
    const r = cap.getBoundingClientRect();
    const x = e.clientX + 18 + r.width > innerWidth ? e.clientX - r.width - 18 : e.clientX + 18;
    cap.style.transform = `translate3d(${x}px,${e.clientY + 18}px,0)`;
  }
  addEventListener("keydown", (e) => {
    if (!document.body.classList.contains("v-home")) return;
    const d = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (d) { C.vx += d[0] * 9; C.vy += d[1] * 9; wake(); }
  });

  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 180); });

  /* ——————————————————— Pages ——————————————————— */
  const view = $("#view");
  let base = "home";       // dernière page « liste » (planche ou index), pour revenir d'un projet
  let filter = "Tout";
  let cleanup = () => {};

  function route() {
    const [a, b] = location.hash.replace(/^#\/?/, "").split("/");
    cleanup(); cleanup = () => {};
    if (a === "p" && bySlug[b]) show("project", b);
    else if (a === "index") show("index");
    else if (a === "contact") show("contact");
    else show("home");
  }

  function show(v, slug) {
    document.body.className = `v-${v}${document.body.classList.contains("touched") ? " touched" : ""}`;
    $$(".bar-nav a").forEach((a) => a.classList.toggle("on", a.dataset.v === v || (v === "project" && a.dataset.v === base)));
    closeLb();
    if (v === "home") {
      base = "home";
      view.classList.remove("open");
      C.running = true;
      document.title = `${S.name} · ${S.role}`;
      return;
    }
    unhover();
    view.classList.remove("is-project");
    if (v === "index") { base = "index"; renderIndex(); document.title = `Index · ${S.name}`; }
    if (v === "contact") { renderContact(); document.title = `Contact · ${S.name}`; }
    if (v === "project") { renderProject(slug); document.title = `${bySlug[slug].title} · ${S.name}`; }
    view.scrollTop = 0;
    view.classList.add("open");
    setTimeout(() => { if (view.classList.contains("open")) C.running = false; }, 520);
  }

  /* Index des projets */
  function renderIndex() {
    const cats = ["Tout", ...window.CATEGORIES];
    const count = (c) => (c === "Tout" ? P.length : P.filter((p) => p.cat === c).length);
    view.innerHTML = `
      <div class="ix">
        <div class="ix-top">
          <h2 class="rise">Index<sup>${pad(P.length)}</sup></h2>
          <div class="chips rise" style="--d:2">${cats.map((c) => `<button class="chip mono${c === filter ? " on" : ""}" data-c="${esc(c)}">${esc(c)} <span>${count(c)}</span></button>`).join("")}</div>
        </div>
        <ol class="ix-list">${P.map((p, i) => `
          <li class="ix-li rise" style="--d:${Math.min(i, 10) + 3}" data-cat="${esc(p.cat)}">
            <a class="ix-row" href="#/p/${p.slug}" data-slug="${p.slug}">
              <span class="ix-n mono">${pad(i + 1)}</span>
              <span class="ix-t">${esc(p.title)}</span>
              <span class="ix-meta mono">${esc(p.cat)}${p.year ? ` · ${esc(p.year)}` : ""}</span>
              <span class="ix-c mono">${esc(p.client)}</span>
              <span class="ix-k mono">${esc(p.cat)}</span>
              <span class="ix-y mono">${esc(p.year || "—")}</span>
              <img class="ix-thumb" src="${src(nm(p.slug, p.tile))}" alt="" loading="lazy" decoding="async" style="object-position:${p.pos || "50% 50%"}">
            </a>
          </li>`).join("")}
        </ol>
      </div>
      <div class="ix-float"><img alt=""></div>`;
    view.scrollTop = 0;
    const apply = () => $$(".ix-li", view).forEach((li) => li.classList.toggle("out", filter !== "Tout" && li.dataset.cat !== filter));
    apply();
    $(".chips", view).addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      filter = b.dataset.c;
      $$(".chip", view).forEach((c) => c.classList.toggle("on", c === b));
      apply();
    });

    // Aperçu qui suit le curseur et fait défiler les photos du projet
    const fl = $(".ix-float", view), fi = $("img", fl);
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, timer = 0, cur = null;
    const follow = () => {
      x += (tx - x) * 0.16; y += (ty - y) * 0.16;
      fl.style.transform = `translate3d(${x}px,${y}px,0)`;
      raf = requestAnimationFrame(follow);
    };
    const mv = (e) => {
      const w = fl.offsetWidth, h = fl.offsetHeight || w;
      tx = clamp(e.clientX + 30, 0, innerWidth - w - 10);
      if (e.clientX + 30 + w > innerWidth - 10) tx = e.clientX - w - 30;
      ty = clamp(e.clientY - h / 2, 70, innerHeight - h - 20);
    };
    const enter = (e) => {
      const row = e.target.closest(".ix-row");
      if (!row || row === cur || !mouse.matches) return;
      cur = row;
      const p = bySlug[row.dataset.slug];
      const seq = [p.tile, ...Array.from({ length: p.images }, (_, k) => k + 1).filter((k) => k !== p.tile && !SKIP.has(nm(p.slug, k)))];
      let k = 0;
      fi.src = src(nm(p.slug, seq[0]));
      clearInterval(timer);
      timer = setInterval(() => { k = (k + 1) % seq.length; fi.src = src(nm(p.slug, seq[k])); }, 700);
      if (!fl.classList.contains("on")) { x = tx; y = ty; }
      fl.classList.add("on");
    };
    const leave = (e) => {
      if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(".ix-row")) return;
      cur = null; clearInterval(timer); fl.classList.remove("on");
    };
    view.addEventListener("pointermove", mv);
    view.addEventListener("pointerover", enter);
    view.addEventListener("pointerout", leave);
    follow();
    cleanup = () => {
      cancelAnimationFrame(raf); clearInterval(timer);
      view.removeEventListener("pointermove", mv);
      view.removeEventListener("pointerover", enter);
      view.removeEventListener("pointerout", leave);
    };
  }

  /* Exposition d'un projet */
  function renderProject(slug) {
    const p = bySlug[slug];
    const next = P[p.n % P.length];
    const names = Array.from({ length: p.images }, (_, k) => nm(p.slug, k + 1));
    const LAND = [62, 50, 70, 56], PORT = [76, 66], ALIGN = ["", "t", "b", "", "b", "t"];
    let land = 0, port = 0;
    const figs = names.map((n, k) => {
      const ra = ratio(n), portrait = ra < 0.95;
      const h = portrait ? PORT[port++ % PORT.length] : LAND[land % LAND.length];
      const mob = portrait ? `port${port % 2 ? "" : " r"}` : land++ % 2 ? "" : "bleed";
      return `
        <figure class="pj-fig ${mob} ${ALIGN[k % ALIGN.length]}" style="--h:min(${h}vh, calc(100vh - 230px))" data-k="${k}">
          ${imgTag(n, `${p.title}, photo ${k + 1}`, "", "(min-width: 900px) 60vw, 100vw")}
          <figcaption class="mono"><span>${pad(k + 1)} / ${pad(p.images)}</span><span>${esc(p.title)}</span></figcaption>
        </figure>`;
    }).join("");
    view.classList.add("is-project");
    view.innerHTML = `
      <article class="pj">
        <div class="pj-track">
          <header class="pj-intro">
            <p class="pj-num mono rise">Projet ${pad(p.n)} / ${pad(P.length)}</p>
            <h2 class="rise" style="--d:1">${esc(p.title)}</h2>
            <dl class="pj-facts mono rise" style="--d:2">
              <dt>Client</dt><dd>${esc(p.client)}</dd>
              <dt>Type</dt><dd>${esc(p.type)}</dd>
              ${p.year ? `<dt>Année</dt><dd>${esc(p.year)}</dd>` : ""}
              <dt>Photos</dt><dd>${p.images}</dd>
            </dl>
            <p class="pj-text rise" style="--d:3">${esc(p.text)}</p>
            <p class="pj-hint mono rise" style="--d:4">Faire défiler →</p>
          </header>
          ${figs}
          <footer class="pj-end">
            <p class="mono" style="color:var(--mute)">Projet suivant</p>
            <a class="pj-next" href="#/p/${next.slug}">
              <b>${esc(next.title)}</b>
              ${imgTag(nm(next.slug, next.tile), next.title, "", "(min-width: 900px) 40vw, 100vw", `style="object-position:${next.pos || "50% 50%"}"`)}
            </a>
            <a class="pj-contact mono" href="#/contact">Un projet dans cet esprit&nbsp;? Écrivez-moi →</a>
          </footer>
        </div>
        <div class="pj-ui mono">
          <a href="${base === "index" ? "#/index" : "#/"}">← Retour</a>
          <span class="pj-bar"><i></i></span>
          <span class="pj-count">01 / ${pad(p.images)}</span>
        </div>
      </article>`;

    const track = $(".pj-track", view), bar = $(".pj-bar i", view), cnt = $(".pj-count", view);
    const figEls = $$(".pj-fig", view);
    let pos = 0, tgt = 0, anim = 0;
    const max = () => track.scrollWidth - track.clientWidth;
    const update = () => {
      if (!wide.matches) return;
      const m = max();
      bar.style.transform = `scaleX(${m > 0 ? track.scrollLeft / m : 0})`;
      const mid = innerWidth / 2;
      let best = 0, bd = Infinity;
      figEls.forEach((f, k) => { const r = f.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = k; } });
      cnt.textContent = `${pad(best + 1)} / ${pad(p.images)}`;
    };
    const loop = () => {
      pos += (tgt - pos) * 0.12;
      if (Math.abs(tgt - pos) < 0.5) pos = tgt;
      track.scrollLeft = pos;
      update();
      anim = pos !== tgt ? requestAnimationFrame(loop) : 0;
    };
    const go = (d) => {
      if (!anim) pos = tgt = track.scrollLeft;
      tgt = clamp(tgt + d, 0, max());
      if (!anim) anim = requestAnimationFrame(loop);
    };
    track.addEventListener("wheel", (e) => {
      if (!wide.matches) return;
      e.preventDefault();
      const k = e.deltaMode === 1 ? 30 : 1;
      go((Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * k);
    }, { passive: false });
    track.addEventListener("scroll", () => { if (!anim) update(); }, { passive: true });

    // Glisser à la souris pour faire défiler
    const dg = { on: false, moved: false, x: 0, s: 0 };
    track.addEventListener("pointerdown", (e) => {
      if (!wide.matches || e.pointerType !== "mouse" || e.button !== 0) return;
      Object.assign(dg, { on: true, moved: false, x: e.clientX, s: track.scrollLeft });
      cancelAnimationFrame(anim); anim = 0;
    });
    const dmove = (e) => {
      if (!dg.on) return;
      const dx = e.clientX - dg.x;
      if (Math.abs(dx) > 5) dg.moved = true;
      if (dg.moved) { track.scrollLeft = dg.s - dx; pos = tgt = track.scrollLeft; update(); }
    };
    const dup = () => { dg.on = false; };
    addEventListener("pointermove", dmove);
    addEventListener("pointerup", dup);
    track.addEventListener("dragstart", (e) => e.preventDefault());
    track.addEventListener("click", (e) => {
      if (dg.moved) { e.preventDefault(); e.stopPropagation(); dg.moved = false; return; }
      const f = e.target.closest(".pj-fig");
      if (f) openLb(names, +f.dataset.k, p.title);
    }, true);
    const keys = (e) => {
      if (!$("#lb").hidden) return;
      if (e.key === "Escape") location.hash = base === "index" ? "#/index" : "#/";
      if (!wide.matches) return;
      if (e.key === "ArrowRight") go(innerWidth * 0.6);
      if (e.key === "ArrowLeft") go(-innerWidth * 0.6);
    };
    addEventListener("keydown", keys);
    update();
    cleanup = () => {
      cancelAnimationFrame(anim);
      removeEventListener("pointermove", dmove);
      removeEventListener("pointerup", dup);
      removeEventListener("keydown", keys);
    };
  }

  /* Contact */
  const PRINTS = [["bilal", 1, -34, 4, -6], ["vitality", 1, 30, -6, 5], ["kimpembe", 2, 0, 2, -1]];
  function renderContact() {
    const frames = P.map((p) => nm(p.slug, p.tile));
    const strip = [...frames, ...frames].map((n, k) => `
      <figure><img src="${src(n)}" alt="" loading="lazy" decoding="async"><figcaption>LV ▸ ${pad((k % frames.length) + 1)}A</figcaption></figure>`).join("");
    view.innerHTML = `
      <div class="ct">
        <div class="ct-main">
          <p class="mono rise" style="color:var(--mute)">Contact</p>
          <div class="ct-grid">
            <div>
              <h2 class="rise" style="--d:1;margin-top:18px">Un projet<br><em>en tête&nbsp;?</em></h2>
              <p class="ct-lead rise" style="--d:2">Racontez-moi votre idée, la date et le lieu. Je vous réponds rapidement pour en parler.</p>
              <a class="ct-mail rise" style="--d:3" href="mailto:${esc(S.email)}?subject=${encodeURIComponent("Projet photo / vidéo")}">${esc(S.email)}</a>
              <div class="ct-actions rise" style="--d:4">
                <a class="btn solid mono" href="mailto:${esc(S.email)}?subject=${encodeURIComponent("Projet photo / vidéo")}">Écrire un message</a>
                <button class="btn mono" type="button" data-copy>Copier l'adresse</button>
                <a class="btn mono" href="${esc(S.instagram)}" target="_blank" rel="noopener">Instagram ↗</a>
              </div>
            </div>
            <div class="ct-prints rise" style="--d:3" aria-hidden="true">${PRINTS.map(([s, i, x, y, r]) => `
              <figure style="--x:${x}%;--y:${y}%;--r:${r}deg"><img src="${src(nm(s, i))}" alt="" decoding="async" style="object-position:${(bySlug[s].pos) || "50% 50%"}"><figcaption>${esc(bySlug[s].title)}</figcaption></figure>`).join("")}
            </div>
          </div>
        </div>
        <div class="strip" aria-hidden="true"><div class="strip-run">${strip}</div></div>
        <div class="ct-foot mono"><span>© ${new Date().getFullYear()} ${esc(S.name)}</span><span>${esc(S.city)} · Partout ailleurs</span></div>
      </div>`;
    $("[data-copy]", view).addEventListener("click", async (e) => {
      const b = e.currentTarget;
      try { await navigator.clipboard.writeText(S.email); b.textContent = "Adresse copiée ✓"; }
      catch { b.textContent = S.email; }
      setTimeout(() => { b.textContent = "Copier l'adresse"; }, 2200);
    });
  }

  /* ——————————————————— Visionneuse ——————————————————— */
  const lb = $("#lb"), lbImg = $("img", lb);
  const L = { names: [], k: 0, title: "" };
  function openLb(names, k, title) {
    Object.assign(L, { names, k, title });
    lb.hidden = false;
    paint();
  }
  function closeLb() { lb.hidden = true; lbImg.removeAttribute("src"); }
  function paint() {
    const n = L.names[L.k];
    lbImg.src = src(n, true);
    lbImg.alt = `${L.title}, photo ${L.k + 1}`;
    $(".lb-count", lb).textContent = `${L.title} — ${pad(L.k + 1)} / ${pad(L.names.length)}`;
  }
  const step = (d) => { L.k = mod(L.k + d, L.names.length); paint(); };
  $(".lb-close", lb).onclick = closeLb;
  $(".lb-prev", lb).onclick = () => step(-1);
  $(".lb-next", lb).onclick = () => step(1);
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") { e.stopImmediatePropagation(); closeLb(); }
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  }, true);
  let sx = null;
  lb.addEventListener("pointerdown", (e) => { sx = e.clientX; });
  lb.addEventListener("pointerup", (e) => {
    if (sx === null) return;
    const d = e.clientX - sx; sx = null;
    if (Math.abs(d) > 50) step(d < 0 ? 1 : -1);
  });

  /* ——————————————————— Mode sombre / clair ——————————————————— */
  const themeBtn = $("#theme");
  const meta = $('meta[name="theme-color"]');
  function setTheme(t, save) {
    document.documentElement.dataset.theme = t;
    const next = t === "light" ? "Sombre" : "Clair";
    themeBtn.querySelector("span").textContent = next;
    themeBtn.setAttribute("aria-label", `Passer en mode ${next.toLowerCase()}`);
    if (meta) meta.content = t === "light" ? "#f2f0eb" : "#0c0c0b";
    if (save) { try { localStorage.setItem("theme", t); } catch (e) { /* navigation privée */ } }
  }
  setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark", false);
  themeBtn.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light", true));

  /* ——————————————————— Démarrage ——————————————————— */
  build();
  requestAnimationFrame(tick);
  addEventListener("hashchange", route);
  route();
})();
