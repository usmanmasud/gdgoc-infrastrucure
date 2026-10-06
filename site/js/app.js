/* InfraTrack — GDGoC BUK Infrastructure Cluster learning tracker. */
(() => {
  const D = window.InfraData, Store = window.InfraStore, P = window.InfraConfig.PROGRAM;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ic = (name, cls = "") => `<span class="ms ${cls}" aria-hidden="true">${name}</span>`;
  const view = $("#view");

  // ---------- dates ----------
  const z = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  const todayStr = () => ymd(new Date());
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const fmt = (s, o = { day: "numeric", month: "short" }) => parse(s).toLocaleDateString("en-GB", o);
  const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };

  const currentModule = () => { const t = todayStr(); let cur = D.modules[0]; for (const m of D.modules) if (m.date <= t) cur = m; return cur; };
  const nextSession = () => D.modules.find((m) => m.date >= todayStr()) || null;
  const modById = (id) => D.modules.find((m) => m.id === id);

  // ---------- stats ----------
  const HOURS_GOAL = { "2-4": 3, "4-6": 5, "6-10": 8, "10+": 10 };

  function streaks(days) {
    const set = new Set(days);
    let cur = 0, d = todayStr();
    if (!set.has(d)) d = addDays(d, -1);
    while (set.has(d)) { cur++; d = addDays(d, -1); }
    let best = 0, run = 0, prev = null;
    for (const x of [...set].sort()) {
      run = prev && addDays(prev, 1) === x ? run + 1 : 1;
      best = Math.max(best, run); prev = x;
    }
    return { cur, best };
  }

  function stats(st = Store.state) {
    const p = st.progress, mods = {};
    let labsDone = 0, labsTotal = 0, xp = 0, pctSum = 0, subs = 0, quizzes = 0;
    for (const m of D.modules) {
      const done = m.labs.reduce((n, _, i) => n + (p.labs[`${m.id}-${i}`] ? 1 : 0), 0);
      const q = p.quizzes[m.id], sub = p.submissions[m.id];
      const pct = Math.round(((done / m.labs.length) * 0.6 + (q ? q.best / q.total : 0) * 0.2 + (sub ? 0.2 : 0)) * 100);
      mods[m.id] = { done, total: m.labs.length, quiz: q, sub, pct };
      labsDone += done; labsTotal += m.labs.length; pctSum += pct;
      if (sub) subs++;
      if (q) quizzes++;
      xp += done * 10 + (q ? q.best * 10 : 0) + (sub ? 30 : 0);
    }
    const drillList = Object.values(p.drills || {});
    const drillsSolved = drillList.filter((d) => d.solved).length;
    xp += drillList.reduce((n, d) => n + (d.solved ? (d.revealed ? 2 : 5) : 0), 0);
    const setupDone = Object.values(p.setup || {}).filter(Boolean).length;
    const cardsKnown = Object.values(p.cards || {}).filter(Boolean).length;
    const interviewReady = Object.values(p.interview || {}).filter(Boolean).length;
    xp += setupDone * 5 + cardsKnown * 2 + interviewReady * 3 + (p.mixed ? p.mixed.best * 3 : 0);
    const logDays = [...new Set(p.logs.map((l) => l.date))];
    xp += logDays.length * 5;
    const minutes = p.logs.reduce((n, l) => n + (Number(l.minutes) || 0), 0);
    const weekStart = addDays(todayStr(), -((new Date().getDay() + 6) % 7));
    const weekMinutes = p.logs.filter((l) => l.date >= weekStart).reduce((n, l) => n + (Number(l.minutes) || 0), 0);
    const { cur: streak, best: bestStreak } = streaks([...Object.keys(p.activity || {}), ...logDays]);
    const overall = Math.round(pctSum / D.modules.length);
    const perfectQuiz = Object.values(p.quizzes).some((q) => q.best === q.total);
    const full = (ids) => ids.every((id) => mods[id].done === mods[id].total);
    const badges = [
      ["joined", "Registered", "how_to_reg", "Joined the semester track", !!st.profile],
      ["setup", "Lab Ready", "build", "Completed the setup checklist", setupDone >= D.setup.length],
      ["firstlab", "First Lab", "science", "Finished your first lab", labsDone >= 1],
      ["streak3", "On a Roll", "local_fire_department", "3-day learning streak", bestStreak >= 3],
      ["streak7", "Unstoppable", "whatshot", "7-day learning streak", bestStreak >= 7],
      ["drill10", "Terminal Ninja", "terminal", "Solved 10 command drills", drillsSolved >= 10],
      ["drill30", "Command Master", "keyboard_command_key", "Solved 30 command drills", drillsSolved >= 30],
      ["quizace", "Quiz Ace", "military_tech", "Scored 100% on a module quiz", perfectQuiz],
      ["shipper", "Shipper", "rocket_launch", "Submitted your first project milestone", subs >= 1],
      ["foundations", "Foundations", "foundation", "All labs in Weeks 1–3", full(["w1", "w2", "w3"])],
      ["containers", "Containerized", "deployed_code", "All labs in Weeks 4–5", full(["w4", "w5"])],
      ["cloud", "Cloud Native", "cloud_done", "All labs in Weeks 6–7", full(["w6", "w7"])],
      ["automation", "Automator", "autorenew", "All labs in Week 8", full(["w8"])],
      ["hours20", "20 Hours", "schedule", "Logged 20 hours of learning", minutes >= 1200],
      ["graduate", "Graduate", "school", "80% overall progress", overall >= 80]
    ].map(([id, name, icon, desc, earned]) => ({ id, name, icon, desc, earned }));
    return { mods, labsDone, labsTotal, xp, overall, subs, quizzes, drillsSolved, setupDone, cardsKnown, interviewReady, minutes, weekMinutes, streak, bestStreak, badges, logDays };
  }

  Store.setSummarizer((st) => {
    const s = stats(st), pr = st.profile || {};
    return { name: pr.fullName || "", level: pr.level || "", department: pr.department || "", career: st.progress.career || "", xp: s.xp, pct: s.overall, streak: s.streak, labs: s.labsDone };
  });

  // ---------- ui helpers ----------
  const bar = (pct, color = "blue") => `<div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.min(100, pct)}%;background:var(--${color})"></i></div>`;
  function ring(pct, size = 64, color = "blue") {
    const r = (size - 8) / 2, c = 2 * Math.PI * r;
    return `<div class="ring" style="width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-bg"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fg" style="stroke:var(--${color})" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - Math.min(100, pct) / 100)).toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
      </svg><span>${pct}%</span></div>`;
  }
  const chip = (text, color = "muted") => `<span class="chip chip-${color}">${esc(text)}</span>`;
  const hours = (min) => (min / 60).toFixed(min % 60 === 0 ? 0 : 1);

  let toastTimer;
  function toast(msg, kind = "") {
    const t = $("#toast");
    t.className = `toast show ${kind}`;
    t.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.className = "toast"), 2600);
  }

  function moduleStatus(m, ms) {
    if (ms.pct >= 100) return ["Completed", "green"];
    if (m.id === currentModule().id) return ["This week", "blue"];
    if (m.date > todayStr()) return ["Upcoming", "muted"];
    return ms.pct > 0 ? ["In progress", "yellow"] : ["Catch up", "red"];
  }

  // ---------- chrome ----------
  const NAV = [
    ["", "Dashboard", "space_dashboard"],
    ["roadmap", "Roadmap", "route"],
    ["practice", "Practice", "terminal"],
    ["journal", "Journal", "edit_note"],
    ["career", "Career", "work"],
    ["leaderboard", "Leaderboard", "leaderboard"],
    ["resources", "Resources", "menu_book"],
    ["profile", "Profile", "person"]
  ];

  function renderNav(active) {
    const nav = $("#nav");
    const registered = !!Store.state.profile;
    if (!registered) { nav.innerHTML = ""; document.body.classList.add("no-nav"); return; }
    document.body.classList.remove("no-nav");
    const items = [...NAV, ...(Store.isAdmin ? [["admin", "Admin", "admin_panel_settings"]] : [])];
    const s = stats();
    nav.innerHTML = `
      <div class="nav-links">${items.map(([r, label, icon]) => `<a href="#/${r}" class="${active === r ? "active" : ""}">${ic(icon)}<span>${label}</span></a>`).join("")}</div>
      <div class="nav-card">
        <div class="nav-card-row"><span>Overall</span><b>${s.overall}%</b></div>
        ${bar(s.overall)}
        <div class="nav-card-stats"><span title="Experience points">${ic("bolt")}${s.xp} XP</span><span title="Current streak">${ic("local_fire_department")}${s.streak}d</span></div>
      </div>`;
  }

  function renderChrome() {
    const st = Store.saveState, el = $("#saveState");
    el.innerHTML = { saving: `${ic("sync")}Saving…`, saved: `${ic("cloud_done")}Saved`, error: `${ic("error")}Not saved` }[st] || "";
    el.className = `save-state ${st}`;
    const pr = Store.state.profile;
    $("#userChip").innerHTML = pr ? `<a href="#/profile" class="avatar" title="${esc(pr.fullName)}">${esc(initials(pr.fullName))}</a>` : "";
    const active = (location.hash.replace(/^#\/?/, "").split("/")[0]) || "";
    renderNav(active);
  }
  const initials = (n = "") => n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  // ---------- router ----------
  let lastHash = null;
  function route() {
    if (!Store.ready) { view.innerHTML = `<div class="loading">${ic("progress_activity", "spin")} Loading…</div>`; return; }
    const [name = "", arg] = location.hash.replace(/^#\/?/, "").split("/");
    const needsAuth = Store.mode === "firebase" && !Store.user;
    const registered = !!Store.state.profile;
    let target = name;
    if (needsAuth) target = "welcome";
    else if (!registered && !["welcome", "register"].includes(name)) target = "welcome";
    else if (registered && ["welcome", "register"].includes(name)) target = "";
    if (target !== name) history.replaceState(null, "", `#/${target}`);
    const fn = ROUTES[target] || ROUTES[""];
    fn(target === name ? arg : undefined);
    renderChrome();
    if (location.hash !== lastHash) { window.scrollTo(0, 0); lastHash = location.hash; view.focus({ preventScroll: true }); }
    document.title = `${P.name} · ${P.short}`;
  }
  function rerender() { const y = window.scrollY; route(); window.scrollTo(0, y); }
  const go = (h) => { location.hash = h; };

  // ---------- views ----------
  function welcome() {
    const needsAuth = Store.mode === "firebase" && !Store.user;
    const nxt = nextSession();
    view.innerHTML = `
      <section class="hero">
        <div class="hero-text">
          <p class="eyebrow">${esc(P.short)} · ${esc(P.cluster)}</p>
          <h1>${esc(P.track)}</h1>
          <p class="lead">A ${D.modules.length}-week, hands-on path for the ${esc(P.term.toLowerCase())}: from Linux to shipping a deployed, automated app on Google Cloud. Track your labs, practise in the terminal, log your learning and plan your career.</p>
          <div class="hero-meta">
            ${chip(`${fmt(D.modules[0].date)} – ${fmt(P.end, { day: "numeric", month: "short", year: "numeric" })}`, "blue")}
            ${chip(`${D.modules.length} weekly sessions`, "green")}
            ${chip("Demo Day · " + fmt(P.end), "red")}
          </div>
          <div class="hero-cta">
            ${needsAuth
              ? `<button class="btn primary lg" id="signin">${ic("login")}Continue with Google</button>`
              : `<a class="btn primary lg" href="#/register">${ic("how_to_reg")}Register for the semester</a>`}
            <a class="btn ghost lg" href="#roadmap-preview">See the roadmap</a>
          </div>
          ${nxt ? `<p class="muted small">Next session: <b>Week ${nxt.week} — ${esc(nxt.title)}</b>, ${fmt(nxt.date, { weekday: "long", day: "numeric", month: "long" })}</p>` : ""}
        </div>
        <div class="hero-art" aria-hidden="true">${heroArt()}</div>
      </section>
      <section class="features">
        ${[
          ["route", "blue", "Structured roadmap", "Ten weekly modules with objectives, labs, challenges and a project milestone."],
          ["terminal", "green", "Practice that sticks", "Terminal drills, quizzes, flashcards and interview questions."],
          ["insights", "yellow", "Track everything", "Progress, XP, streaks, badges and a learning journal with a heatmap."],
          ["work", "red", "Career-ready", "Choose a track: Cloud, DevOps, SRE, Security or Builder, and get a plan."]
        ].map(([i, c, t, d]) => `<div class="card feature"><span class="feature-ic bg-${c}">${ic(i)}</span><h3>${t}</h3><p>${d}</p></div>`).join("")}
      </section>
      <section id="roadmap-preview" class="section">
        <h2>The semester at a glance</h2>
        <p class="muted">Every week adds a layer to one project, <b>CampusBoard</b>, so you finish with a real, deployed portfolio piece.</p>
        <ol class="preview-list">
          ${D.modules.map((m) => `<li><span class="pl-date">${fmt(m.date)}</span><span class="pl-week">W${m.week}</span><span class="pl-title">${esc(m.title)}</span>${chip(m.tag, D.tags[m.tag])}</li>`).join("")}
        </ol>
      </section>
      <footer class="foot muted small">${esc(P.chapter)} · ${esc(P.cluster)} · Led by ${esc(P.lead)}</footer>`;
    const btn = $("#signin");
    if (btn) btn.onclick = async () => {
      btn.disabled = true;
      try { await Store.signIn(); } catch (e) { toast(e.code === "auth/popup-closed-by-user" ? "Sign-in cancelled" : "Sign-in failed. Try again.", "error"); btn.disabled = false; }
    };
  }

  function heroArt() {
    return `<svg viewBox="0 0 320 260" class="art">
      <rect x="20" y="30" width="280" height="206" rx="14" class="art-win"/>
      <rect x="20" y="30" width="280" height="30" rx="14" class="art-bar"/>
      <rect x="20" y="46" width="280" height="14" class="art-bar"/>
      <circle cx="40" cy="45" r="5" fill="var(--red)"/><circle cx="56" cy="45" r="5" fill="var(--yellow)"/><circle cx="72" cy="45" r="5" fill="var(--green)"/>
      <text x="38" y="92" class="art-mono"><tspan fill="var(--green)">$</tspan> docker compose up -d</text>
      <text x="38" y="116" class="art-mono art-dim">✔ campusboard-db   started</text>
      <text x="38" y="138" class="art-mono art-dim">✔ campusboard-api  started</text>
      <text x="38" y="166" class="art-mono"><tspan fill="var(--green)">$</tspan> gcloud run deploy</text>
      <text x="38" y="190" class="art-mono"><tspan fill="var(--blue)">→</tspan> https://campusboard.run.app</text>
      <text x="38" y="216" class="art-mono"><tspan fill="var(--green)">$</tspan></text>
      <rect x="52" y="204" width="8" height="15" fill="var(--blue)" class="blink"/>
    </svg>`;
  }

  // ----- registration form (also used to edit profile) -----
  const FACULTIES = ["Computing", "Engineering", "Physical Sciences", "Life Sciences", "Earth & Environmental Sciences", "Social & Management Sciences", "Education", "Arts & Islamic Studies", "Law", "Agriculture", "Communication", "Basic Medical Sciences", "Clinical Sciences", "Allied Health Sciences", "Pharmaceutical Sciences"];
  const EXPERIENCE = [["linux", "Linux"], ["git", "Git & GitHub"], ["networking", "Networking"], ["docker", "Docker"], ["cloud", "Any cloud platform"], ["python", "Python"], ["javascript", "JavaScript"], ["other-lang", "Another language"]];

  function profileForm(p = {}, edit = false) {
    const sel = (name, opts, val, req = true) => `<select name="${name}" ${req ? "required" : ""}><option value="">Select…</option>${opts.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(val) === String(v) ? "selected" : ""}>${esc(l)}</option>`; }).join("")}</select>`;
    const exp = new Set(p.experience || []);
    const email = p.email || Store.user?.email || "";
    return `
      <form id="profileForm" class="form" novalidate>
        <fieldset><legend>${ic("badge")}Personal details</legend>
          <div class="grid2">
            <label class="field"><span>Full name *</span><input name="fullName" required autocomplete="name" value="${esc(p.fullName)}" placeholder="e.g. Aisha Musa Bello"></label>
            <label class="field"><span>Registration number *</span><input name="regNo" required value="${esc(p.regNo)}" placeholder="e.g. CST/21/COM/00123" style="text-transform:uppercase"></label>
            <label class="field"><span>Email *</span><input name="email" type="email" required autocomplete="email" value="${esc(email)}" ${Store.user?.email ? "readonly" : ""}></label>
            <label class="field"><span>Phone / WhatsApp *</span><input name="phone" type="tel" required autocomplete="tel" value="${esc(p.phone)}" placeholder="e.g. 0803 000 0000"></label>
            <label class="field"><span>Gender</span>${sel("gender", ["Male", "Female", "Prefer not to say"], p.gender, false)}</label>
          </div>
        </fieldset>
        <fieldset><legend>${ic("school")}Academic details</legend>
          <div class="grid2">
            <label class="field"><span>Faculty *</span><input name="faculty" required list="faculties" value="${esc(p.faculty)}" placeholder="Start typing…"><datalist id="faculties">${FACULTIES.map((f) => `<option value="${esc(f)}">`).join("")}</datalist></label>
            <label class="field"><span>Department *</span><input name="department" required value="${esc(p.department)}" placeholder="e.g. Software Engineering"></label>
            <label class="field"><span>Level *</span>${sel("level", ["100", "200", "300", "400", "500", "Postgraduate"].map((l) => [l, /\d/.test(l) ? `${l} Level` : l]), p.level)}</label>
            <label class="field"><span>Semester *</span>${sel("semester", ["First", "Second"].map((s) => [s, `${s} Semester`]), p.semester || "Second")}</label>
          </div>
        </fieldset>
        <fieldset><legend>${ic("terminal")}Your starting point</legend>
          <div class="grid2">
            <label class="field"><span>Did you attend last semester's sessions? *</span>${sel("attended", [["all", "Yes, most of them"], ["some", "Some of them"], ["none", "No, I'm new"]], p.attended)}</label>
            <label class="field"><span>Your laptop *</span>${sel("laptop", [["windows", "Windows"], ["mac", "macOS"], ["linux", "Linux"], ["shared", "I share a laptop"], ["none", "No laptop (phone only)"]], p.laptop)}</label>
          </div>
          <div class="field"><span>How comfortable are you with the Linux terminal? *</span>
            <div class="scale">${[1, 2, 3, 4, 5].map((n) => `<label><input type="radio" name="linux" value="${n}" ${String(p.linux) === String(n) ? "checked" : ""} required><span>${n}</span></label>`).join("")}</div>
            <small class="muted">1 = never used it · 5 = I script in Bash comfortably</small></div>
          <div class="field"><span>What have you used before?</span>
            <div class="checks">${EXPERIENCE.map(([v, l]) => `<label class="check"><input type="checkbox" name="experience" value="${v}" ${exp.has(v) ? "checked" : ""}><span>${l}</span></label>`).join("")}</div></div>
          <div class="grid2">
            <label class="field"><span>GitHub username</span><input name="github" value="${esc(p.github)}" placeholder="e.g. aishabello"></label>
            <label class="field"><span>LinkedIn profile URL</span><input name="linkedin" type="url" value="${esc(p.linkedin)}" placeholder="https://linkedin.com/in/…"></label>
          </div>
        </fieldset>
        <fieldset><legend>${ic("flag")}Goals</legend>
          <div class="grid2">
            <label class="field"><span>Career direction *</span>${sel("goal", D.careers.map((c) => [c.id, c.name]), p.goal)}</label>
            <label class="field"><span>Hours per week you can commit *</span>${sel("hours", [["2-4", "2–4 hours"], ["4-6", "4–6 hours"], ["6-10", "6–10 hours"], ["10+", "10+ hours"]], p.hours)}</label>
          </div>
          <label class="field"><span>What do you want to achieve by ${fmt(P.end, { day: "numeric", month: "long" })}? *</span><textarea name="motivation" required rows="3" placeholder="e.g. Deploy my first app on Google Cloud and pass the Cloud Digital Leader exam">${esc(p.motivation)}</textarea></label>
          <label class="field"><span>Anything we should know? (accessibility, schedule clashes, internet access…)</span><textarea name="notes" rows="2">${esc(p.notes)}</textarea></label>
        </fieldset>
        ${edit ? "" : `<label class="check consent"><input type="checkbox" name="consent" required><span>I agree that the ${esc(P.short)} ${esc(P.cluster)} leads may use these details to organise sessions, track progress and contact me about the program.</span></label>`}
        <div class="form-actions"><button class="btn primary lg" type="submit">${ic(edit ? "save" : "how_to_reg")}${edit ? "Save changes" : "Complete registration"}</button></div>
      </form>`;
  }

  function readProfileForm(form) {
    const fd = new FormData(form);
    const val = (k) => String(fd.get(k) || "").trim();
    let gh = val("github").replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/^@/, "").replace(/\/.*$/, "");
    return {
      fullName: val("fullName").replace(/\s+/g, " "), regNo: val("regNo").toUpperCase(), email: val("email"), phone: val("phone"),
      gender: val("gender"), faculty: val("faculty"), department: val("department"), level: val("level"), semester: val("semester"),
      attended: val("attended"), laptop: val("laptop"), linux: val("linux"), experience: fd.getAll("experience"),
      github: gh, linkedin: val("linkedin"), goal: val("goal"), hours: val("hours"), motivation: val("motivation"), notes: val("notes")
    };
  }

  function bindProfileForm(edit, after) {
    const form = $("#profileForm");
    form.onsubmit = (e) => {
      e.preventDefault();
      $$(".invalid", form).forEach((el) => el.classList.remove("invalid"));
      const bad = $$("input,select,textarea", form).filter((el) => !el.checkValidity());
      if (bad.length) {
        bad.forEach((el) => (el.closest(".field, .check") || el).classList.add("invalid"));
        bad[0].focus();
        toast("Please complete the highlighted fields", "error");
        return;
      }
      Store.saveProfile(readProfileForm(form));
      after();
    };
  }

  function register() {
    view.innerHTML = `
      <div class="page-head"><p class="eyebrow">${esc(P.term)} · ${esc(P.cluster)}</p><h1>Register for ${esc(P.track)}</h1>
      <p class="muted">Takes about two minutes. Your answers help us plan sessions, pair you with the right teammates and tailor your career plan.</p></div>
      <div class="card pad">${profileForm({}, false)}</div>`;
    bindProfileForm(false, () => { toast("Welcome aboard! 🎉", "success"); go("#/"); });
  }

  // ----- dashboard -----
  function dashboard() {
    const st = Store.state, pr = st.profile, s = stats(), cur = currentModule(), nxt = nextSession();
    const h = new Date().getHours();
    const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    const totalDays = daysBetween(P.start, P.end), passed = Math.max(0, Math.min(totalDays, daysBetween(P.start, todayStr())));
    const left = Math.max(0, daysBetween(todayStr(), P.end));
    const ms = s.mods[cur.id];
    const goal = HOURS_GOAL[pr.hours] || 4;
    const earned = s.badges.filter((b) => b.earned);
    const nextBadge = s.badges.find((b) => !b.earned);
    view.innerHTML = `
      <div class="page-head row">
        <div><p class="eyebrow">${esc(pr.level)}${/\d/.test(pr.level) ? " Level" : ""} · ${esc(pr.department)}</p>
        <h1>${greet}, ${esc(pr.fullName.split(" ")[0])}</h1>
        <p class="muted">${left > 0 ? `${left} days to Demo Day. Keep the streak going.` : left === 0 ? "It's Demo Day! Go show what you built." : "The semester is complete. Well done!"}</p></div>
      </div>

      <section class="stats">
        <div class="stat card"><div class="stat-ring">${ring(s.overall, 64, "blue")}</div><div><span class="stat-label">Overall progress</span><span class="stat-sub">${s.labsDone}/${s.labsTotal} labs · ${s.quizzes}/${D.modules.length} quizzes</span></div></div>
        <div class="stat card"><span class="stat-ic bg-yellow">${ic("bolt")}</span><div><span class="stat-num">${s.xp}</span><span class="stat-label">XP earned</span></div></div>
        <div class="stat card"><span class="stat-ic bg-red">${ic("local_fire_department")}</span><div><span class="stat-num">${s.streak}<small> day${s.streak === 1 ? "" : "s"}</small></span><span class="stat-label">Streak · best ${s.bestStreak}</span></div></div>
        <div class="stat card"><span class="stat-ic bg-green">${ic("schedule")}</span><div><span class="stat-num">${hours(s.weekMinutes)}<small>/${goal}h</small></span><span class="stat-label">This week · ${hours(s.minutes)}h total</span></div></div>
      </section>

      <div class="cols">
        <div class="col-main">
          <section class="card pad">
            <div class="card-head"><div><p class="eyebrow">This week · Week ${cur.week}</p><h2><a href="#/module/${cur.id}">${esc(cur.title)}</a></h2></div>${ring(ms.pct, 52, "green")}</div>
            <ul class="checklist">${cur.labs.map((l, i) => labItem(cur.id, i, l)).join("")}</ul>
            <div class="card-foot"><a class="btn" href="#/module/${cur.id}">Open module ${ic("arrow_forward")}</a>
            ${ms.quiz ? chip(`Quiz ${ms.quiz.best}/${ms.quiz.total}`, "green") : chip("Quiz not taken", "muted")}
            ${ms.sub ? chip("Milestone submitted", "green") : chip("Milestone due", "yellow")}</div>
          </section>

          <section class="card pad">
            <div class="card-head"><h2>Semester roadmap</h2><a href="#/roadmap" class="link">View all</a></div>
            <div class="timeline-mini">${D.modules.map((m) => { const mm = s.mods[m.id], [lbl, col] = moduleStatus(m, mm); return `<a href="#/module/${m.id}" class="tm ${m.id === cur.id ? "is-current" : ""}" title="Week ${m.week}: ${esc(m.title)} — ${lbl}"><span class="tm-dot dot-${col}">${mm.pct >= 100 ? ic("check") : m.week}</span><span class="tm-date">${fmt(m.date)}</span>${bar(mm.pct, col === "muted" ? "blue" : col)}</a>`; }).join("")}</div>
            <div class="semester-bar"><span class="muted small">${fmt(P.start)}</span>${bar(Math.round((passed / totalDays) * 100), "yellow")}<span class="muted small">${fmt(P.end)}</span></div>
          </section>
        </div>

        <aside class="col-side">
          ${nxt ? `<section class="card pad next">
            <p class="eyebrow">Next session</p>
            <h3>${esc(nxt.title)}</h3>
            <p class="next-date">${ic("event")}${fmt(nxt.date, { weekday: "long", day: "numeric", month: "long" })}</p>
            <p class="muted small">${daysBetween(todayStr(), nxt.date) === 0 ? "Today!" : `In ${daysBetween(todayStr(), nxt.date)} day${daysBetween(todayStr(), nxt.date) === 1 ? "" : "s"}`} · ${esc(P.sessionNote)}</p>
          </section>` : ""}
          <section class="card pad">
            <h3>Quick actions</h3>
            <div class="quick">
              <a href="#/journal" class="quick-item">${ic("edit_note", "c-blue")}<span>Log today's learning</span></a>
              <a href="#/practice/drills" class="quick-item">${ic("terminal", "c-green")}<span>Solve a terminal drill</span></a>
              <a href="#/practice/quiz" class="quick-item">${ic("quiz", "c-yellow")}<span>Take a mixed quiz</span></a>
              <a href="#/career" class="quick-item">${ic("work", "c-red")}<span>Your career plan</span></a>
            </div>
          </section>
          <section class="card pad">
            <div class="card-head"><h3>Badges</h3><span class="muted small">${earned.length}/${s.badges.length}</span></div>
            <div class="badges">${s.badges.map((b) => `<span class="badge ${b.earned ? "earned" : ""}" title="${esc(b.name)}: ${esc(b.desc)}">${ic(b.icon)}</span>`).join("")}</div>
            ${nextBadge ? `<p class="muted small">Next: <b>${esc(nextBadge.name)}</b>, ${esc(nextBadge.desc.toLowerCase())}.</p>` : `<p class="muted small">You've earned every badge. Legend.</p>`}
          </section>
        </aside>
      </div>`;
    bindLabs();
  }

  function labItem(mid, i, text) {
    const id = `${mid}-${i}`, done = !!Store.state.progress.labs[id];
    return `<li><label class="task ${done ? "done" : ""}"><input type="checkbox" data-lab="${id}" ${done ? "checked" : ""}><span class="box">${ic("check")}</span><span>${esc(text)}</span></label></li>`;
  }
  function bindLabs() {
    $$("[data-lab]", view).forEach((cb) => cb.addEventListener("change", () => {
      Store.update((p) => { if (cb.checked) p.labs[cb.dataset.lab] = new Date().toISOString(); else delete p.labs[cb.dataset.lab]; });
      if (cb.checked) toast("+10 XP", "success");
      rerender();
    }));
  }

  // ----- roadmap -----
  function roadmap() {
    const s = stats();
    const steps = ["Bash scripts", "Static site on NGINX", "On GitHub with PRs", "Dockerized", "Compose: web + API + DB", "Live on Google Cloud", "Cloud Run + Cloud SQL", "Auto-deployed via CI/CD", "Team capstone", "Demo Day"];
    view.innerHTML = `
      <div class="page-head"><p class="eyebrow">${fmt(D.modules[0].date)} – ${fmt(P.end)}</p><h1>Semester roadmap</h1>
      <p class="muted">Ten modules, one continuous project. About 25% theory and 75% hands-on in every session.</p></div>

      <section class="card pad project">
        <h2>${ic("deployed_code", "c-blue")} The continuous project: CampusBoard</h2>
        <p class="muted">A small campus events & announcements app. Every week it grows by one layer, so you finish with a single impressive portfolio project instead of scattered exercises.</p>
        <ol class="growth">${steps.map((t, i) => `<li><span>W${i + 1}</span>${t}</li>`).join("")}</ol>
      </section>

      <div class="legend">${Object.entries(D.tags).map(([t, c]) => chip(t, c)).join("")}</div>
      <ol class="roadmap">
        ${D.modules.map((m) => {
          const mm = s.mods[m.id], [lbl, col] = moduleStatus(m, mm);
          return `<li class="rm ${m.id === currentModule().id ? "is-current" : ""}">
            <div class="rm-rail"><span class="rm-dot dot-${col}">${mm.pct >= 100 ? ic("check") : m.week}</span></div>
            <a class="card rm-card" href="#/module/${m.id}">
              <div class="rm-top"><span class="muted small">Week ${m.week} · ${fmt(m.date, { weekday: "short", day: "numeric", month: "short" })}</span><span>${chip(m.tag, D.tags[m.tag])} ${chip(lbl, col)}</span></div>
              <h3>${esc(m.title)}</h3>
              <p class="muted">${esc(m.summary)}</p>
              <div class="rm-foot">${bar(mm.pct, "green")}<span class="small muted">${mm.done}/${mm.total} labs · ${mm.pct}%</span></div>
            </a></li>`;
        }).join("")}
      </ol>

      <section class="card pad">
        <h2>How each session runs</h2>
        <div class="table-wrap"><table class="table"><thead><tr><th>Segment</th><th>Time</th><th>Purpose</th></tr></thead>
        <tbody>${D.sessionFormat.map((r) => `<tr><td><b>${r[0]}</b></td><td class="nowrap">${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table></div>
        <p class="muted small">${esc(P.sessionNote)}</p>
      </section>`;
  }

  // ----- module -----
  function moduleView(id) {
    const m = modById(id);
    if (!m) return go("#/roadmap");
    const s = stats(), mm = s.mods[m.id], idx = D.modules.indexOf(m);
    const prev = D.modules[idx - 1], next = D.modules[idx + 1];
    const sub = Store.state.progress.submissions[m.id];
    const rev = Store.reviews?.[m.id];
    const [lbl, col] = moduleStatus(m, mm);
    view.innerHTML = `
      <nav class="crumbs"><a href="#/roadmap">Roadmap</a>${ic("chevron_right")}<span>Week ${m.week}</span></nav>
      <div class="page-head row">
        <div><p class="eyebrow">Week ${m.week} · ${fmt(m.date, { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1>${esc(m.title)}</h1>
        <p class="muted">${esc(m.summary)}</p>
        <div class="chips">${chip(m.tag, D.tags[m.tag])} ${chip(lbl, col)}</div></div>
        ${ring(mm.pct, 84, "green")}
      </div>

      <div class="cols">
        <div class="col-main">
          <section class="card pad"><h2>${ic("target", "c-blue")}You will be able to</h2><ul class="bullets">${m.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}</ul></section>
          <section class="card pad"><h2>${ic("topic", "c-yellow")}Topics</h2><ul class="bullets two">${m.topics.map((o) => `<li>${esc(o)}</li>`).join("")}</ul></section>
          <section class="card pad"><div class="card-head"><h2>${ic("science", "c-green")}Hands-on labs</h2><span class="muted small">${mm.done}/${mm.total} · 10 XP each</span></div>
            <ul class="checklist">${m.labs.map((l, i) => labItem(m.id, i, l)).join("")}</ul></section>
          <section class="card pad callout"><h2>${ic("bolt", "c-red")}Challenge</h2><p>${esc(m.challenge)}</p></section>
          <section class="card pad">
            <h2>${ic("rocket_launch", "c-blue")}Project milestone</h2>
            <p>${esc(m.deliverable)}</p>
            <form id="subForm" class="form inline-form">
              <label class="field"><span>Link to your work (GitHub repo, commit, PR or live URL)</span><input name="url" type="url" required placeholder="https://github.com/you/campusboard" value="${esc(sub?.url)}"></label>
              <label class="field"><span>Short note: what you did, what was hard</span><textarea name="note" rows="2">${esc(sub?.note)}</textarea></label>
              <div class="form-actions"><button class="btn primary">${ic("send")}${sub ? "Update submission" : "Submit milestone (+30 XP)"}</button>
              ${sub ? `<span class="muted small">Submitted ${new Date(sub.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>` : ""}</div>
            </form>
            ${rev ? `<div class="review review-${esc(rev.status)}"><b>${ic("rate_review")}Mentor review: ${esc(reviewLabel(rev.status))}</b>${rev.feedback ? `<p>${esc(rev.feedback)}</p>` : ""}</div>` : ""}
          </section>
          <section class="card pad"><div class="card-head"><h2>${ic("quiz", "c-yellow")}Check your understanding</h2>${mm.quiz ? `<span class="muted small">Best ${mm.quiz.best}/${mm.quiz.total} · ${mm.quiz.attempts} attempt${mm.quiz.attempts > 1 ? "s" : ""}</span>` : `<span class="muted small">10 XP per correct answer (best score)</span>`}</div><div id="quiz"></div></section>
        </div>
        <aside class="col-side">
          <section class="card pad"><h3>Resources</h3><ul class="links">${m.resources.map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${ic("open_in_new")}${esc(r.title)}</a></li>`).join("")}</ul></section>
          <section class="card pad"><h3>Practice this week</h3>
            <div class="quick">
              <a class="quick-item" href="#/practice/drills">${ic("terminal", "c-green")}<span>Terminal drills</span></a>
              <a class="quick-item" href="#/practice/cards">${ic("style", "c-blue")}<span>Flashcards</span></a>
              <a class="quick-item" href="#/journal">${ic("edit_note", "c-yellow")}<span>Log what you learned</span></a>
            </div></section>
          <section class="pager">
            ${prev ? `<a class="card pad pg" href="#/module/${prev.id}"><span class="muted small">${ic("arrow_back")} Week ${prev.week}</span><b>${esc(prev.title)}</b></a>` : ""}
            ${next ? `<a class="card pad pg right" href="#/module/${next.id}"><span class="muted small">Week ${next.week} ${ic("arrow_forward")}</span><b>${esc(next.title)}</b></a>` : ""}
          </section>
        </aside>
      </div>`;
    bindLabs();
    $("#subForm").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target), url = String(fd.get("url")).trim();
      if (!/^https?:\/\/\S+\.\S+/.test(url)) { toast("Enter a valid link starting with https://", "error"); return; }
      const first = !sub;
      Store.update((p) => { p.submissions[m.id] = { url, note: String(fd.get("note")).trim(), at: new Date().toISOString() }; });
      toast(first ? "Milestone submitted · +30 XP 🚀" : "Submission updated", "success");
      rerender();
    };
    quizBlock($("#quiz"), m.quiz, m.id, (score, total) => {
      Store.update((p) => {
        const q = p.quizzes[m.id] || { best: 0, total, attempts: 0 };
        p.quizzes[m.id] = { best: Math.max(q.best, score), total, attempts: q.attempts + 1, last: score, at: new Date().toISOString() };
      });
    });
  }
  const reviewLabel = (s) => ({ excellent: "Excellent work", approved: "Approved", "needs-work": "Needs work" }[s] || s);

  function quizBlock(el, questions, key, onDone) {
    let answers = {}, result = null;
    const render = () => {
      const score = result ? result.filter(Boolean).length : 0;
      el.innerHTML = `<form class="quiz">${questions.map((q, i) => `
        <fieldset class="q ${result ? (result[i] ? "right" : "wrong") : ""}">
          <legend><span class="qn">${i + 1}</span><span>${esc(q.q)}${q.src ? ` <small class="muted">· ${esc(q.src)}</small>` : ""}</span></legend>
          <div class="opts">${q.o.map((o, j) => `<label class="opt ${result && j === q.a ? "is-answer" : ""} ${result && answers[i] === j && j !== q.a ? "is-wrong" : ""}">
            <input type="radio" name="${key}-${i}" value="${j}" ${answers[i] === j ? "checked" : ""} ${result ? "disabled" : ""}><span>${esc(o)}</span></label>`).join("")}</div>
          ${result ? `<p class="explain">${ic(result[i] ? "check_circle" : "info")}<span>${esc(q.e)}</span></p>` : ""}
        </fieldset>`).join("")}
        <div class="quiz-foot">${result
          ? `<span class="score ${score === questions.length ? "perfect" : ""}">${ic(score === questions.length ? "emoji_events" : "insights")}${score}/${questions.length} correct</span><button type="button" class="btn" data-retake>${ic("refresh")}Try again</button>`
          : `<button class="btn primary">Submit answers</button><span class="muted small">${Object.keys(answers).length}/${questions.length} answered</span>`}</div></form>`;
      const form = $("form", el);
      form.onchange = (e) => {
        if (e.target.type !== "radio") return;
        answers[Number(e.target.name.split("-").pop())] = Number(e.target.value);
        $(".quiz-foot .muted", el) && ($(".quiz-foot .muted", el).textContent = `${Object.keys(answers).length}/${questions.length} answered`);
      };
      form.onsubmit = (e) => {
        e.preventDefault();
        if (Object.keys(answers).length < questions.length) { toast("Answer every question first", "error"); return; }
        result = questions.map((q, i) => answers[i] === q.a);
        const sc = result.filter(Boolean).length;
        onDone(sc, questions.length);
        toast(sc === questions.length ? "Perfect score! 🏆" : `You scored ${sc}/${questions.length}`, sc === questions.length ? "success" : "");
        render();
      };
      const rt = $("[data-retake]", el);
      if (rt) rt.onclick = () => { answers = {}; result = null; render(); };
    };
    render();
  }

  // ----- practice -----
  const PRACTICE_TABS = [["drills", "Terminal drills", "terminal"], ["quiz", "Mixed quiz", "quiz"], ["cards", "Flashcards", "style"], ["interview", "Interview prep", "record_voice_over"]];
  function practice(tab = "drills") {
    if (!PRACTICE_TABS.some((t) => t[0] === tab)) tab = "drills";
    const s = stats();
    view.innerHTML = `
      <div class="page-head"><p class="eyebrow">Practice</p><h1>Build muscle memory</h1>
      <p class="muted">${s.drillsSolved}/${D.drills.length} drills solved · ${s.cardsKnown}/${D.cards.length} flashcards known · ${s.interviewReady}/${D.interview.length} interview answers ready</p></div>
      <div class="tabs" role="tablist">${PRACTICE_TABS.map(([id, label, icon]) => `<a role="tab" href="#/practice/${id}" class="${tab === id ? "active" : ""}" aria-selected="${tab === id}">${ic(icon)}${label}</a>`).join("")}</div>
      <div id="pt"></div>`;
    ({ drills: drillsTab, quiz: mixedQuizTab, cards: cardsTab, interview: interviewTab })[tab]($("#pt"));
  }

  let drillCat = "All", drillId = null;
  const normCmd = (s) => s.trim().replace(/\s+/g, " ").replace(/^sudo /, "");
  const drillOk = (d, input) => d.ok.some((r) => new RegExp(`^(?:${r})$`).test(normCmd(input)));

  function drillsTab(el) {
    const prog = Store.state.progress.drills;
    const list = D.drills.filter((d) => drillCat === "All" || d.cat === drillCat);
    if (!drillId || !list.some((d) => d.id === drillId)) drillId = (list.find((d) => !prog[d.id]?.solved) || list[0]).id;
    const d = D.drills.find((x) => x.id === drillId);
    const solvedIn = (c) => D.drills.filter((x) => (c === "All" || x.cat === c) && prog[x.id]?.solved).length;
    const totalIn = (c) => D.drills.filter((x) => c === "All" || x.cat === c).length;
    el.innerHTML = `
      <div class="filters">${["All", ...D.drillCats].map((c) => `<button class="filter ${c === drillCat ? "active" : ""}" data-cat="${c}">${c} <small>${solvedIn(c)}/${totalIn(c)}</small></button>`).join("")}</div>
      <div class="terminal" id="term">
        <div class="term-bar"><i></i><i></i><i></i><span>${esc(d.cat.toLowerCase())} — drill ${list.indexOf(d) + 1} of ${list.length}</span></div>
        <div class="term-body" id="termBody">
          <p class="term-task"># ${esc(d.task)}</p>
          ${prog[d.id]?.solved ? `<p class="term-ok">✓ Solved${prog[d.id].revealed ? " (answer revealed)" : ""}. One accepted answer: ${esc(d.sol)}</p>` : ""}
        </div>
        <form class="term-input" id="termForm" autocomplete="off">
          <label for="cmd"><span class="c-green">student@gdgoc</span>:<span class="c-blue">~</span>$</label>
          <input id="cmd" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Type your command">
        </form>
      </div>
      <div class="term-actions">
        <button class="btn" data-act="hint">${ic("lightbulb")}Hint</button>
        <button class="btn" data-act="reveal">${ic("visibility")}Show answer</button>
        <button class="btn primary" data-act="next">Next drill ${ic("arrow_forward")}</button>
      </div>
      <p class="muted small">Type the command and press Enter. A leading <code>sudo</code> is ignored. 5 XP per drill (2 XP if you reveal the answer first).</p>
      <div class="drill-grid">${list.map((x, i) => `<button class="dg ${x.id === d.id ? "current" : ""} ${prog[x.id]?.solved ? "solved" : ""}" data-drill="${x.id}" title="${esc(x.task)}">${prog[x.id]?.solved ? ic("check") : i + 1}</button>`).join("")}</div>`;

    const body = $("#termBody"), input = $("#cmd");
    const out = (cls, text) => { const p = document.createElement("p"); p.className = cls; p.textContent = text; body.appendChild(p); body.scrollTop = body.scrollHeight; };
    input.focus({ preventScroll: true });
    $$("[data-cat]", el).forEach((b) => (b.onclick = () => { drillCat = b.dataset.cat; drillId = null; drillsTab(el); }));
    $$("[data-drill]", el).forEach((b) => (b.onclick = () => { drillId = b.dataset.drill; drillsTab(el); }));
    const next = () => {
      const i = list.indexOf(d);
      const after = [...list.slice(i + 1), ...list.slice(0, i)];
      drillId = (after.find((x) => !Store.state.progress.drills[x.id]?.solved) || after[0] || d).id;
      drillsTab(el);
    };
    $("#termForm").onsubmit = (e) => {
      e.preventDefault();
      const v = input.value;
      if (!v.trim()) { if (Store.state.progress.drills[d.id]?.solved) next(); return; }
      out("term-cmd", `$ ${v}`);
      input.value = "";
      if (drillOk(d, v)) {
        const was = Store.state.progress.drills[d.id];
        if (!was?.solved) {
          Store.update((p) => { p.drills[d.id] = { solved: true, revealed: !!was?.revealed, at: new Date().toISOString() }; });
          out("term-ok", `✓ Correct! +${was?.revealed ? 2 : 5} XP. Press Enter for the next drill.`);
        } else out("term-ok", "✓ Correct! Press Enter for the next drill.");
        $(`[data-drill="${d.id}"]`, el)?.classList.add("solved");
      } else out("term-err", "✗ Not quite. Check the flags and try again, or ask for a hint.");
    };
    $$("[data-act]", el).forEach((b) => (b.onclick = () => {
      const act = b.dataset.act;
      if (act === "hint") out("term-hint", `hint: ${d.hint}`);
      if (act === "reveal") {
        out("term-hint", `answer: ${d.sol}`);
        if (!Store.state.progress.drills[d.id]) Store.update((p) => { p.drills[d.id] = { solved: false, revealed: true }; });
      }
      if (act === "next") next();
      input.focus();
    }));
  }

  function shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function mixedQuizTab(el) {
    const mixed = Store.state.progress.mixed;
    const pool = D.modules.flatMap((m) => m.quiz.map((q) => ({ ...q, src: `Week ${m.week}` })));
    const qs = shuffle(pool).slice(0, 10);
    el.innerHTML = `<section class="card pad"><div class="card-head"><div><h2>Mixed review: 10 random questions</h2><p class="muted small">Drawn from all ${D.modules.length} modules. ${mixed ? `Best: ${mixed.best}/10 · ${mixed.attempts} attempts` : "3 XP per correct answer (best score)."}</p></div>
      <button class="btn" id="newSet">${ic("shuffle")}New set</button></div><div id="mq"></div></section>`;
    $("#newSet").onclick = () => mixedQuizTab(el);
    quizBlock($("#mq"), qs, "mix", (score, total) => Store.update((p) => {
      const q = p.mixed || { best: 0, attempts: 0 };
      p.mixed = { best: Math.max(q.best, score), total, attempts: q.attempts + 1 };
    }));
  }

  let deck = "Cloud map", cardIdx = 0;
  function cardsTab(el) {
    const known = Store.state.progress.cards;
    const decks = [...new Set(D.cards.map((c) => c.deck))];
    const list = D.cards.filter((c) => c.deck === deck);
    const order = [...list.filter((c) => !known[c.id]), ...list.filter((c) => known[c.id])];
    if (cardIdx >= order.length) cardIdx = 0;
    const c = order[cardIdx];
    const k = list.filter((x) => known[x.id]).length;
    el.innerHTML = `
      <div class="filters">${decks.map((d) => `<button class="filter ${d === deck ? "active" : ""}" data-deck="${d}">${d} <small>${D.cards.filter((x) => x.deck === d && known[x.id]).length}/${D.cards.filter((x) => x.deck === d).length}</small></button>`).join("")}</div>
      <div class="flash-wrap">
        <button class="flash" id="flash" aria-live="polite"><span class="flash-inner"><span class="flash-face front"><small class="muted">${esc(deck)} · ${cardIdx + 1}/${order.length}${known[c.id] ? " · known" : ""}</small><b>${esc(c.front)}</b><small class="muted">Tap to flip</small></span>
        <span class="flash-face back"><small class="muted">Answer</small><span>${esc(c.back)}</span></span></span></button>
        <div class="flash-actions"><button class="btn" data-k="0">${ic("replay")}Again</button><button class="btn primary" data-k="1">${ic("check")}Got it</button></div>
        <div class="muted small center">${k}/${list.length} known in this deck · 2 XP each</div>
      </div>`;
    const f = $("#flash");
    f.onclick = () => f.classList.toggle("flipped");
    $$("[data-deck]", el).forEach((b) => (b.onclick = () => { deck = b.dataset.deck; cardIdx = 0; cardsTab(el); }));
    $$("[data-k]", el).forEach((b) => (b.onclick = () => {
      const val = b.dataset.k === "1", was = !!known[c.id];
      if (was !== val) Store.update((p) => { if (val) p.cards[c.id] = true; else delete p.cards[c.id]; });
      // A newly known card moves to the back of the order, so the same index already shows the next card.
      if (!(val && !was)) cardIdx++;
      cardsTab(el);
    }));
  }

  let ivTopic = "All";
  function interviewTab(el) {
    const ready = Store.state.progress.interview;
    const topics = ["All", ...new Set(D.interview.map((q) => q.t))];
    const list = D.interview.filter((q) => ivTopic === "All" || q.t === ivTopic);
    el.innerHTML = `
      <div class="filters">${topics.map((t) => `<button class="filter ${t === ivTopic ? "active" : ""}" data-t="${t}">${t}</button>`).join("")}</div>
      <p class="muted small">Answer out loud first (time yourself: 2 minutes), then compare with the model answer. Mark the ones you can explain confidently.</p>
      <div class="iv-list">${list.map((q) => `
        <details class="card iv"><summary><span class="iv-q">${esc(q.q)}</span>${chip(q.t, "muted")}${ready[q.id] ? ic("check_circle", "c-green") : ""}</summary>
          <div class="iv-a"><p>${esc(q.a)}</p>
          <label class="check"><input type="checkbox" data-iv="${q.id}" ${ready[q.id] ? "checked" : ""}><span>I can answer this confidently (+3 XP)</span></label></div>
        </details>`).join("")}</div>`;
    $$("[data-t]", el).forEach((b) => (b.onclick = () => { ivTopic = b.dataset.t; interviewTab(el); }));
    $$("[data-iv]", el).forEach((cb) => (cb.onchange = () => {
      Store.update((p) => { if (cb.checked) p.interview[cb.dataset.iv] = true; else delete p.interview[cb.dataset.iv]; });
      const open = cb.closest("details");
      interviewTab(el);
      const again = $(`[data-iv="${cb.dataset.iv}"]`, el)?.closest("details");
      if (again && open) again.open = true;
    }));
  }

  // ----- journal -----
  function journal() {
    const p = Store.state.progress, s = stats(), pr = Store.state.profile;
    const goal = HOURS_GOAL[pr.hours] || 4;
    const logs = [...p.logs].sort((a, b) => (b.date + (b.at || "")).localeCompare(a.date + (a.at || "")));
    view.innerHTML = `
      <div class="page-head"><p class="eyebrow">Learning journal</p><h1>Log it, see it, keep going</h1>
      <p class="muted">Short daily entries beat long weekly ones. Writing down what you learned is how it sticks.</p></div>
      <section class="stats">
        <div class="stat card"><span class="stat-ic bg-blue">${ic("timer")}</span><div><span class="stat-num">${hours(s.weekMinutes)}<small>/${goal}h</small></span><span class="stat-label">This week</span>${bar(Math.round((s.weekMinutes / 60 / goal) * 100), "blue")}</div></div>
        <div class="stat card"><span class="stat-ic bg-green">${ic("schedule")}</span><div><span class="stat-num">${hours(s.minutes)}h</span><span class="stat-label">Total logged</span></div></div>
        <div class="stat card"><span class="stat-ic bg-red">${ic("local_fire_department")}</span><div><span class="stat-num">${s.streak}<small>d</small></span><span class="stat-label">Streak · best ${s.bestStreak}</span></div></div>
        <div class="stat card"><span class="stat-ic bg-yellow">${ic("edit_note")}</span><div><span class="stat-num">${p.logs.length}</span><span class="stat-label">Entries</span></div></div>
      </section>
      <section class="card pad"><div class="card-head"><h2>Activity this semester</h2><span class="muted small">Any lab, drill, quiz or journal entry counts</span></div>${heatmap()}</section>
      <div class="cols">
        <div class="col-main">
          <section class="card pad"><h2>New entry</h2>
            <form id="logForm" class="form">
              <div class="grid3">
                <label class="field"><span>Date</span><input type="date" name="date" value="${todayStr()}" max="${todayStr()}" required></label>
                <label class="field"><span>Minutes</span><input type="number" name="minutes" min="5" max="720" step="5" value="60" required></label>
                <label class="field"><span>Module</span><select name="module">${D.modules.map((m) => `<option value="${m.id}" ${m.id === currentModule().id ? "selected" : ""}>W${m.week} · ${esc(m.title)}</option>`).join("")}<option value="other">Self-study / other</option></select></label>
              </div>
              <label class="field"><span>What did you learn or build?</span><textarea name="what" rows="3" required placeholder="e.g. Wrote my first Dockerfile; learned why COPY order matters for caching"></textarea></label>
              <label class="field"><span>Blockers or questions (optional)</span><input name="blockers" placeholder="Bring these to Lab Night"></label>
              <div class="form-actions"><button class="btn primary">${ic("add")}Add entry</button></div>
            </form></section>
        </div>
        <aside class="col-side"><section class="card pad"><h3>Entries</h3>
          ${logs.length ? `<ul class="logs">${logs.map((l) => `<li><div class="log-top"><b>${fmt(l.date, { weekday: "short", day: "numeric", month: "short" })}</b><span class="muted small">${l.minutes} min · ${l.module === "other" ? "Other" : "W" + (modById(l.module)?.week ?? "?")}</span><button class="icon-btn sm" data-del="${esc(l.id)}" aria-label="Delete entry">${ic("delete")}</button></div><p>${esc(l.what)}</p>${l.blockers ? `<p class="muted small">${ic("help")} ${esc(l.blockers)}</p>` : ""}</li>`).join("")}</ul>` : `<p class="muted">No entries yet. Your first one is a click away.</p>`}
        </section></aside>
      </div>`;
    $("#logForm").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target), what = String(fd.get("what")).trim();
      if (!what) { toast("Write a line about what you learned", "error"); return; }
      Store.update((p) => p.logs.push({ id: Math.random().toString(36).slice(2, 10), date: String(fd.get("date")), minutes: Number(fd.get("minutes")) || 0, module: String(fd.get("module")), what, blockers: String(fd.get("blockers")).trim(), at: new Date().toISOString() }));
      toast("Entry saved", "success");
      rerender();
    };
    $$("[data-del]", view).forEach((b) => (b.onclick = () => {
      if (!confirm("Delete this entry?")) return;
      Store.update((p) => { p.logs = p.logs.filter((l) => l.id !== b.dataset.del); });
      rerender();
    }));
  }

  function heatmap() {
    const p = Store.state.progress, mins = {};
    p.logs.forEach((l) => (mins[l.date] = (mins[l.date] || 0) + (Number(l.minutes) || 0)));
    const startD = parse(P.start); startD.setDate(startD.getDate() - ((startD.getDay() + 6) % 7));
    const start = ymd(startD), t = todayStr(), sessions = new Set(D.modules.map((m) => m.date));
    const weeks = Math.ceil((daysBetween(start, P.end) + 1) / 7);
    let cols = "";
    for (let w = 0; w < weeks; w++) {
      let cells = "";
      for (let d = 0; d < 7; d++) {
        const day = addDays(start, w * 7 + d);
        const out = day < P.start || day > P.end;
        const score = (mins[day] || 0) / 30 + (p.activity[day] || 0) / 3;
        const lvl = score === 0 ? 0 : score < 1 ? 1 : score < 2.5 ? 2 : score < 4 ? 3 : 4;
        cells += `<span class="hm l${lvl} ${out ? "out" : ""} ${day === t ? "today" : ""} ${sessions.has(day) ? "session" : ""} ${day > t ? "future" : ""}" title="${fmt(day, { weekday: "short", day: "numeric", month: "short" })}${mins[day] ? ` · ${mins[day]} min` : ""}${sessions.has(day) ? " · session" : ""}"></span>`;
      }
      cols += `<div class="hm-col">${cells}</div>`;
    }
    return `<div class="heatmap-wrap"><div class="hm-days"><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span><span>Sun</span></div><div class="heatmap">${cols}</div></div>
      <div class="hm-legend muted small">Less <span class="hm l0"></span><span class="hm l1"></span><span class="hm l2"></span><span class="hm l3"></span><span class="hm l4"></span> More · <span class="hm l0 session"></span> session day</div>`;
  }

  // ----- career -----
  function career() {
    const p = Store.state.progress;
    const cur = D.careers.find((c) => c.id === p.career) || D.careers.find((c) => c.id === Store.state.profile.goal) || D.careers[0];
    const done = cur.steps.filter((_, i) => p.careerSteps[`${cur.id}-${i}`]).length;
    view.innerHTML = `
      <div class="page-head"><p class="eyebrow">Career</p><h1>Where is this taking you?</h1>
      <p class="muted">Everyone learns the same fundamentals this semester. Your track shapes what you do next: the break, next semester and beyond.</p></div>
      <div class="tracks">${D.careers.map((c) => `<button class="card track ${c.id === cur.id ? "active" : ""}" data-track="${c.id}"><span class="track-bar bg-${c.color}"></span><b>${esc(c.name)}</b><span class="muted small">${esc(c.blurb)}</span></button>`).join("")}</div>
      <div class="cols">
        <div class="col-main">
          <section class="card pad">
            <div class="card-head"><div><p class="eyebrow">Your track</p><h2>${esc(cur.name)}</h2></div>${ring(Math.round((done / cur.steps.length) * 100), 56, cur.color)}</div>
            <p>${esc(cur.blurb)}</p>
            <h3>Next steps (after ${fmt(P.end, { day: "numeric", month: "long" })})</h3>
            <ul class="checklist">${cur.steps.map((st, i) => { const id = `${cur.id}-${i}`, d = !!p.careerSteps[id]; return `<li><label class="task ${d ? "done" : ""}"><input type="checkbox" data-step="${id}" ${d ? "checked" : ""}><span class="box">${ic("check")}</span><span>${esc(st)}</span></label></li>`; }).join("")}</ul>
          </section>
        </div>
        <aside class="col-side">
          <section class="card pad"><h3>Typical roles</h3><div class="chips">${cur.roles.map((r) => chip(r, "blue")).join(" ")}</div></section>
          <section class="card pad"><h3>Core skills</h3><div class="chips">${cur.skills.map((r) => chip(r, "muted")).join(" ")}</div></section>
          <section class="card pad"><h3>Certifications to aim for</h3><ol class="bullets">${cur.certs.map((c) => `<li>${esc(c)}</li>`).join("")}</ol>
          <p class="muted small">Ask the cluster lead about any Google Cloud credits or certification opportunities available to the chapter.</p></section>
        </aside>
      </div>`;
    $$("[data-track]", view).forEach((b) => (b.onclick = () => { Store.update((pp) => { pp.career = b.dataset.track; }); toast("Track updated"); rerender(); }));
    $$("[data-step]", view).forEach((cb) => (cb.onchange = () => { Store.update((pp) => { if (cb.checked) pp.careerSteps[cb.dataset.step] = true; else delete pp.careerSteps[cb.dataset.step]; }); rerender(); }));
  }

  // ----- leaderboard -----
  async function leaderboard() {
    view.innerHTML = `<div class="page-head"><p class="eyebrow">Leaderboard</p><h1>Cluster leaderboard</h1>
      <p class="muted">XP comes from labs, quizzes, milestones, drills and consistent journaling. It rewards steady work, not speed.</p></div>
      <section class="card"><div id="lb" class="pad">${ic("progress_activity", "spin")} Loading…</div></section>`;
    let rows;
    try { rows = await Store.leaderboard(); } catch (e) { console.error(e); $("#lb").innerHTML = `<p class="muted">Couldn't load the leaderboard. Check your connection.</p>`; return; }
    if (!$("#lb")) return;
    const career = (id) => D.careers.find((c) => c.id === id)?.name || "";
    $("#lb").outerHTML = `<div class="table-wrap"><table class="table lb"><thead><tr><th>#</th><th>Member</th><th class="hide-sm">Track</th><th>Progress</th><th class="hide-sm">Streak</th><th class="num">XP</th></tr></thead><tbody>
      ${rows.map((r, i) => `<tr class="${r.me ? "me" : ""}"><td>${i < 3 ? `<span class="medal m${i + 1}">${i + 1}</span>` : i + 1}</td>
        <td><div class="who"><span class="avatar sm">${esc(initials(r.name))}</span><div><b>${esc(r.name)}${r.me ? " (you)" : ""}</b><span class="muted small">${esc(r.level)}${/\d/.test(r.level) ? "L" : ""} · ${esc(r.department)}</span></div></div></td>
        <td class="hide-sm small">${esc(career(r.career))}</td><td class="lb-prog">${bar(r.pct || 0, "green")}<span class="small muted">${r.pct || 0}%</span></td>
        <td class="hide-sm">${r.streak || 0}d</td><td class="num"><b>${r.xp || 0}</b></td></tr>`).join("")}
      </tbody></table></div>
      ${Store.mode === "local" ? `<p class="pad muted small">${ic("info")} Local mode: only you are shown. Connect Firebase (see README) to rank the whole cluster.</p>` : ""}`;
  }

  // ----- resources -----
  function resources() {
    const p = Store.state.progress;
    const map = D.cards.filter((c) => c.deck === "Cloud map").map((c) => [c.front, ...c.back.split(" · ").map((x) => x.replace(/^[^:]+:\s*/, ""))]);
    view.innerHTML = `
      <div class="page-head"><p class="eyebrow">Resources</p><h1>Everything you need</h1></div>
      <div class="cols">
        <div class="col-main">
          <section class="card pad"><div class="card-head"><h2>${ic("build", "c-blue")}Setup checklist</h2><span class="muted small">${Object.values(p.setup).filter(Boolean).length}/${D.setup.length} · 5 XP each</span></div>
            <ul class="checklist">${D.setup.map((t, i) => { const d = !!p.setup[i]; return `<li><label class="task ${d ? "done" : ""}"><input type="checkbox" data-setup="${i}" ${d ? "checked" : ""}><span class="box">${ic("check")}</span><span>${esc(t)}</span></label></li>`; }).join("")}</ul></section>
          <section class="card pad"><h2>${ic("hub", "c-green")}Cloud concept map</h2>
            <p class="muted small">Learn the concept, not the console. Google Cloud first, then the AWS equivalent, and Azure for awareness.</p>
            <div class="table-wrap"><table class="table"><thead><tr><th>Concept</th><th>Google Cloud</th><th>AWS</th><th>Azure</th></tr></thead>
            <tbody>${map.map((r) => `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td class="muted">${esc(r[3])}</td></tr>`).join("")}</tbody></table></div></section>
          <section class="card pad"><h2>${ic("groups", "c-red")}Community activities</h2>
            <ul class="activities">${D.community.map((a) => `<li><b>${esc(a.name)}</b><span class="muted small">${esc(a.when)}</span><p>${esc(a.what)}</p></li>`).join("")}</ul>
            ${P.community ? `<a class="btn primary" href="${esc(P.community)}" target="_blank" rel="noopener">${ic("forum")}Join the cluster channel</a>` : ""}</section>
        </div>
        <aside class="col-side">${D.resourceGroups.map((g) => `<section class="card pad"><h3>${esc(g.title)}</h3><ul class="links">${g.items.map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${ic("open_in_new")}${esc(r.title)}</a></li>`).join("")}</ul></section>`).join("")}</aside>
      </div>`;
    $$("[data-setup]", view).forEach((cb) => (cb.onchange = () => {
      Store.update((pp) => { if (cb.checked) pp.setup[cb.dataset.setup] = true; else delete pp.setup[cb.dataset.setup]; });
      rerender();
    }));
  }

  // ----- profile -----
  function profile() {
    const pr = Store.state.profile, s = stats();
    view.innerHTML = `
      <div class="page-head row"><div><p class="eyebrow">Profile</p><h1>${esc(pr.fullName)}</h1>
        <p class="muted">${esc(pr.regNo)} · ${esc(pr.level)}${/\d/.test(pr.level) ? " Level" : ""} · ${esc(pr.department)}, ${esc(pr.faculty)}</p></div>
        <span class="avatar lg">${esc(initials(pr.fullName))}</span></div>
      <section class="card pad"><h2>Badges</h2><div class="badge-list">${s.badges.map((b) => `<div class="badge-row ${b.earned ? "earned" : ""}"><span class="badge ${b.earned ? "earned" : ""}">${ic(b.icon)}</span><div><b>${esc(b.name)}</b><span class="muted small">${esc(b.desc)}</span></div></div>`).join("")}</div></section>
      <div class="cols">
        <div class="col-main"><section class="card pad"><h2>Edit registration</h2>${profileForm(pr, true)}</section></div>
        <aside class="col-side">
          <section class="card pad"><h3>Account</h3>
            <p class="small">${Store.mode === "firebase" ? `${ic("cloud_done", "c-green")} Synced to the cluster as <b>${esc(Store.user?.email)}</b>` : `${ic("computer", "c-yellow")} Saved in this browser only. Export a backup now and then.`}</p>
            ${Store.mode === "firebase" ? `<p class="muted small">Member ID: <code class="uid">${esc(Store.user?.uid)}</code></p>
              <div class="diag small">${adminDiagnosis()}</div>
              <button class="btn sm" id="recheckAdmin">${ic("refresh")}Re-check admin access</button>` : ""}
            <div class="stack">
              <button class="btn" id="exportBtn">${ic("download")}Export my data</button>
              <label class="btn">${ic("upload")}Import backup<input type="file" id="importFile" accept="application/json" hidden></label>
              ${Store.mode === "firebase" ? `<button class="btn" id="signOut">${ic("logout")}Sign out</button>` : `<button class="btn danger" id="resetBtn">${ic("delete_forever")}Reset everything</button>`}
            </div></section>
          <section class="card pad"><h3>Registered</h3><p class="muted small">${pr.registeredAt ? new Date(pr.registeredAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—"}</p></section>
        </aside>
      </div>`;
    bindProfileForm(true, () => { toast("Profile updated", "success"); rerender(); });
    $("#exportBtn").onclick = () => download(`infratrack-${(pr.regNo || "me").replace(/\W+/g, "-")}.json`, Store.exportJSON(), "application/json");
    $("#importFile").onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      try { const obj = JSON.parse(await f.text()); if (!obj.progress) throw 0; if (!confirm("Replace your current progress with this backup?")) return; Store.importJSON(obj); toast("Backup restored", "success"); rerender(); }
      catch { toast("That file isn't an InfraTrack backup", "error"); }
    };
    const rc = $("#recheckAdmin");
    if (rc) rc.onclick = async () => { rc.disabled = true; await Store.recheckAdmin(); rerender(); toast(Store.isAdmin ? "Admin access confirmed" : "Still not an admin; see the note above", Store.isAdmin ? "success" : "error"); };
    const so = $("#signOut"); if (so) so.onclick = async () => { await Store.signOut(); go("#/welcome"); };
    const rs = $("#resetBtn"); if (rs) rs.onclick = () => { if (confirm("Delete your registration and all progress from this browser? Export a backup first if unsure.")) { Store.resetLocal(); go("#/welcome"); } };
  }

  function adminDiagnosis() {
    const c = Store.adminCheck || "", uid = esc(Store.user?.uid);
    const sync = Store.syncError
      ? `<p class="c-red">${ic("error")} Saving to Firestore failed (<code>${esc(Store.syncError)}</code>). Publish the rules in <b>Firestore Database → Rules</b>, not Realtime Database.</p>` : "";
    if (c === "ok") return `${sync}<p class="c-green">${ic("verified_user")} Admin access: yes. Open <a href="#/admin">Admin</a>.</p>`;
    if (c === "missing") return `${sync}<p>${ic("info")} Admin access: no. Firestore has no document <code>admins/${uid}</code>. In <b>Firestore Database → Data</b> (not Realtime Database), the collection must be named exactly <code>admins</code> and the <b>document ID</b> must be exactly your Member ID above (don't use Auto-ID).</p>`;
    if (c.startsWith("error")) return `${sync}<p class="c-red">${ic("error")} Couldn't check admin access (<code>${esc(c.slice(7))}</code>). ${/permission/i.test(c) ? "Your Firestore rules aren't published yet: paste them in <b>Firestore Database → Rules</b> and click Publish." : "Check your connection and try again."}</p>`;
    return sync;
  }

  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ----- admin -----
  let adminFilter = { q: "", level: "" };
  async function admin() {
    if (!Store.isAdmin) {
      view.innerHTML = `<div class="page-head"><p class="eyebrow">Admin</p><h1>Cluster dashboard</h1></div>
        <section class="card pad"><p>${Store.mode === "local"
          ? "The admin dashboard needs Firebase mode, so registrations from every member are collected in one place. Follow <b>Connect Firebase</b> in the README."
          : `You're not an admin. To grant access, create a document <code>admins/${esc(Store.user?.uid)}</code> in Firestore (any content).`}</p></section>`;
      return;
    }
    view.innerHTML = `<div class="page-head"><p class="eyebrow">Admin</p><h1>Cluster dashboard</h1></div><div id="adm">${ic("progress_activity", "spin")} Loading members…</div>`;
    let members;
    try { members = await Store.allMembers(); } catch (e) { console.error(e); $("#adm").innerHTML = `<p class="muted">Couldn't load members: ${esc(e.message)}</p>`; return; }
    if (!$("#adm")) return;
    const rows = members.filter((m) => m.profile).map((m) => {
      const s = stats(m), act = Object.keys(m.progress.activity || {}).sort().pop() || "";
      return { ...m, s, lastActive: act };
    }).sort((a, b) => b.s.xp - a.s.xp);
    renderAdmin(rows);
  }

  function renderAdmin(rows) {
    const el = $("#adm"), week = addDays(todayStr(), -7);
    const active = rows.filter((r) => r.lastActive >= week).length;
    const avg = rows.length ? Math.round(rows.reduce((n, r) => n + r.s.overall, 0) / rows.length) : 0;
    const pending = rows.reduce((n, r) => n + Object.keys(r.progress.submissions).filter((k) => !r.reviews?.[k]).length, 0);
    const count = (fn) => { const o = {}; rows.forEach((r) => { const k = fn(r) || "—"; o[k] = (o[k] || 0) + 1; }); return Object.entries(o).sort((a, b) => b[1] - a[1]); };
    const breakdown = (title, data, label = (k) => k) => `<section class="card pad"><h3>${title}</h3>${data.map(([k, v]) => `<div class="bd"><span>${esc(label(k))}</span>${bar(Math.round((v / rows.length) * 100), "blue")}<b>${v}</b></div>`).join("") || `<p class="muted small">No data</p>`}</section>`;
    const lbl = { all: "Attended most", some: "Attended some", none: "New member", windows: "Windows", mac: "macOS", linux: "Linux", shared: "Shared laptop", none_: "No laptop" };
    const filtered = rows.filter((r) => (!adminFilter.level || r.profile.level === adminFilter.level) &&
      (!adminFilter.q || `${r.profile.fullName} ${r.profile.regNo} ${r.profile.department} ${r.email}`.toLowerCase().includes(adminFilter.q.toLowerCase())));
    el.innerHTML = `
      <section class="stats">
        <div class="stat card"><span class="stat-ic bg-blue">${ic("group")}</span><div><span class="stat-num">${rows.length}</span><span class="stat-label">Registered</span></div></div>
        <div class="stat card"><span class="stat-ic bg-green">${ic("trending_up")}</span><div><span class="stat-num">${active}</span><span class="stat-label">Active in last 7 days</span></div></div>
        <div class="stat card"><span class="stat-ic bg-yellow">${ic("donut_large")}</span><div><span class="stat-num">${avg}%</span><span class="stat-label">Average progress</span></div></div>
        <div class="stat card"><span class="stat-ic bg-red">${ic("rate_review")}</span><div><span class="stat-num">${pending}</span><span class="stat-label">Submissions to review</span></div></div>
      </section>
      <div class="grid-auto">
        ${breakdown("By level", count((r) => r.profile.level))}
        ${breakdown("By career goal", count((r) => r.profile.goal), (k) => D.careers.find((c) => c.id === k)?.name || k)}
        ${breakdown("Laptop", count((r) => r.profile.laptop), (k) => lbl[k === "none" ? "none_" : k] || k)}
        ${breakdown("Last semester", count((r) => r.profile.attended), (k) => lbl[k] || k)}
      </div>
      <section class="card pad">
        <div class="card-head wrap"><h2>Members</h2>
          <div class="toolbar"><input type="search" id="admQ" placeholder="Search name, reg no, dept…" value="${esc(adminFilter.q)}">
          <select id="admLevel"><option value="">All levels</option>${["100", "200", "300", "400", "500", "Postgraduate"].map((l) => `<option ${adminFilter.level === l ? "selected" : ""}>${l}</option>`).join("")}</select>
          <button class="btn" id="csv">${ic("download")}CSV</button></div></div>
        <div class="table-wrap"><table class="table adm"><thead><tr><th>Member</th><th>Reg no</th><th class="hide-sm">Level</th><th>Progress</th><th class="num">XP</th><th class="hide-sm">Subs</th><th class="hide-sm">Last active</th></tr></thead>
          <tbody>${filtered.map((r) => `<tr class="click" data-uid="${esc(r.uid)}"><td><b>${esc(r.profile.fullName)}</b><span class="muted small block">${esc(r.profile.department)}</span></td><td class="nowrap">${esc(r.profile.regNo)}</td><td class="hide-sm">${esc(r.profile.level)}</td><td class="lb-prog">${bar(r.s.overall, "green")}<span class="small muted">${r.s.overall}%</span></td><td class="num">${r.s.xp}</td><td class="hide-sm">${r.s.subs}</td><td class="hide-sm nowrap small">${r.lastActive ? fmt(r.lastActive) : "—"}</td></tr>`).join("")}</tbody></table></div>
        <p class="muted small">${filtered.length} of ${rows.length} shown · click a row for details and reviews</p>
      </section>
      <div id="memberDetail"></div>`;
    $("#admQ").oninput = (e) => { adminFilter.q = e.target.value; const pos = e.target.selectionStart; renderAdmin(rows); const q = $("#admQ"); q.focus(); q.setSelectionRange(pos, pos); };
    $("#admLevel").onchange = (e) => { adminFilter.level = e.target.value; renderAdmin(rows); };
    $("#csv").onclick = () => download(`infra-cluster-members-${todayStr()}.csv`, toCSV(filtered), "text/csv");
    $$("[data-uid]", el).forEach((tr) => (tr.onclick = () => memberDetail(rows.find((r) => r.uid === tr.dataset.uid), rows)));
  }

  function memberDetail(r, rows) {
    const pr = r.profile, el = $("#memberDetail");
    const field = (k, v) => v ? `<div><span class="muted small">${k}</span><b>${esc(v)}</b></div>` : "";
    el.innerHTML = `<section class="card pad detail">
      <div class="card-head"><div><p class="eyebrow">Member</p><h2>${esc(pr.fullName)}</h2></div><button class="icon-btn" id="closeDetail" aria-label="Close">${ic("close")}</button></div>
      <div class="kv">${field("Reg no", pr.regNo)}${field("Email", r.email || pr.email)}${field("Phone", pr.phone)}${field("Faculty", pr.faculty)}${field("Department", pr.department)}${field("Level", pr.level)}${field("Semester", pr.semester)}${field("Gender", pr.gender)}${field("Laptop", pr.laptop)}${field("Linux comfort", pr.linux ? `${pr.linux}/5` : "")}${field("Experience", (pr.experience || []).join(", "))}${field("GitHub", pr.github)}${field("Goal", D.careers.find((c) => c.id === pr.goal)?.name)}${field("Hours/week", pr.hours)}</div>
      ${pr.motivation ? `<p><span class="muted small">Wants to achieve</span><br>${esc(pr.motivation)}</p>` : ""}
      ${pr.notes ? `<p><span class="muted small">Notes</span><br>${esc(pr.notes)}</p>` : ""}
      <h3>Milestone submissions</h3>
      ${Object.keys(r.progress.submissions).length ? D.modules.filter((m) => r.progress.submissions[m.id]).map((m) => {
        const sub = r.progress.submissions[m.id], rev = r.reviews?.[m.id];
        return `<form class="sub-review" data-mod="${m.id}">
          <div><b>W${m.week} · ${esc(m.title)}</b><br><a href="${esc(sub.url)}" target="_blank" rel="noopener">${esc(sub.url)}</a>${sub.note ? `<p class="muted small">${esc(sub.note)}</p>` : ""}</div>
          <div class="review-ctl"><select name="status">${[["approved", "Approved"], ["excellent", "Excellent"], ["needs-work", "Needs work"]].map(([v, l]) => `<option value="${v}" ${rev?.status === v ? "selected" : ""}>${l}</option>`).join("")}</select>
          <input name="feedback" placeholder="Feedback (optional)" value="${esc(rev?.feedback)}"><button class="btn primary sm">${rev ? "Update" : "Review"}</button></div></form>`;
      }).join("") : `<p class="muted">No submissions yet.</p>`}
    </section>`;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    $("#closeDetail").onclick = () => (el.innerHTML = "");
    $$(".sub-review", el).forEach((f) => (f.onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(f), status = String(fd.get("status")), feedback = String(fd.get("feedback")).trim();
      try {
        await Store.review(r.uid, f.dataset.mod, status, feedback);
        r.reviews = { ...(r.reviews || {}), [f.dataset.mod]: { status, feedback } };
        toast("Review saved", "success");
        renderAdmin(rows); memberDetail(r, rows);
      } catch (err) { toast(err.message || "Couldn't save review", "error"); }
    }));
  }

  function toCSV(rows) {
    const cols = [
      ["Full name", (r) => r.profile.fullName], ["Reg no", (r) => r.profile.regNo], ["Email", (r) => r.email || r.profile.email], ["Phone", (r) => r.profile.phone],
      ["Gender", (r) => r.profile.gender], ["Faculty", (r) => r.profile.faculty], ["Department", (r) => r.profile.department], ["Level", (r) => r.profile.level],
      ["Semester", (r) => r.profile.semester], ["Attended last semester", (r) => r.profile.attended], ["Laptop", (r) => r.profile.laptop], ["Linux comfort", (r) => r.profile.linux],
      ["Experience", (r) => (r.profile.experience || []).join("; ")], ["GitHub", (r) => r.profile.github], ["LinkedIn", (r) => r.profile.linkedin],
      ["Career goal", (r) => D.careers.find((c) => c.id === r.profile.goal)?.name || r.profile.goal], ["Hours/week", (r) => r.profile.hours],
      ["Motivation", (r) => r.profile.motivation], ["Notes", (r) => r.profile.notes],
      ["XP", (r) => r.s.xp], ["Progress %", (r) => r.s.overall], ["Labs done", (r) => r.s.labsDone], ["Quizzes taken", (r) => r.s.quizzes], ["Submissions", (r) => r.s.subs],
      ["Hours logged", (r) => hours(r.s.minutes)], ["Last active", (r) => r.lastActive], ["Registered", (r) => r.profile.registeredAt]
    ];
    const cell = (v) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    return "﻿" + [cols.map((c) => c[0]).join(","), ...rows.map((r) => cols.map((c) => cell(c[1](r))).join(","))].join("\n");
  }

  const ROUTES = { "": dashboard, welcome, register, roadmap, module: moduleView, practice, journal, career, leaderboard, resources, profile, admin };

  // ---------- theme ----------
  function initTheme() {
    const btn = $("#themeBtn");
    const current = () => document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const paint = () => (btn.innerHTML = ic(current() === "dark" ? "light_mode" : "dark_mode"));
    btn.onclick = () => {
      const next = current() === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("gdgoc-infra:theme", next); } catch {}
      paint();
    };
    paint();
  }

  // ---------- boot ----------
  let authKey = "";
  Store.subscribe(() => {
    const k = `${Store.ready}|${Store.user?.uid || ""}|${!!Store.state.profile}`;
    if (k !== authKey) { authKey = k; route(); } else renderChrome();
  });
  window.addEventListener("hashchange", route);
  initTheme();
  route();
  Store.init();
})();
