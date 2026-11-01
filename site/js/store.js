/*
 * InfraTrack data layer.
 * - Local mode: one JSON blob in localStorage.
 * - Firebase mode: Google sign-in + Firestore
 *     members/{uid}      profile + progress (owner & admins can read)
 *     leaderboard/{uid}  public summary (any signed-in member can read)
 *     reviews/{uid}      admin feedback on submissions (admins write)
 *     admins/{uid}       existence = admin (create by hand in the console)
 *     spotlights/{week}  published Learners of the Week (members read, admins write)
 *     certificates/{id}  issued certificates (anyone can read to verify, admins write)
 */
window.InfraStore = (() => {
  const cfg = window.InfraConfig;
  const LS_KEY = "gdgoc-infra:v1";
  const LS_SPOT = "gdgoc-infra:spotlights";
  const LS_CERT = "gdgoc-infra:certificates";
  // Local preview only: set localStorage "gdgoc-infra:local-admin" = "1" to see the admin pages without Firebase.
  const LS_ADMIN = "gdgoc-infra:local-admin";
  const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const FB_VERSION = "10.12.2";

  const blank = () => ({
    profile: null,
    progress: {
      labs: {}, setup: {}, quizzes: {}, mixed: null, drills: {}, cards: {},
      interview: {}, logs: [], submissions: {}, career: null, careerSteps: {}, activity: {}
    }
  });

  const s = {
    mode: cfg.FIREBASE ? "firebase" : "local",
    ready: false,
    user: null,
    isAdmin: false,
    state: blank(),
    reviews: {},
    summarize: () => ({}),
    listeners: new Set(),
    saveState: "idle"
  };

  let fb = null;            // { auth, db, fns }
  let saveTimer = null;

  const emit = () => s.listeners.forEach((fn) => fn());
  const setSave = (v) => { s.saveState = v; emit(); };

  const today = () => {
    const d = new Date(), z = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  };

  function normalize(data) {
    const b = blank();
    const st = { profile: data?.profile || null, progress: { ...b.progress, ...(data?.progress || {}) } };
    if (!Array.isArray(st.progress.logs)) st.progress.logs = [];
    return st;
  }

  function readLocal() {
    try { return normalize(JSON.parse(localStorage.getItem(LS_KEY) || "null")); }
    catch { return blank(); }
  }
  function writeLocal() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(s.state)); } catch {}
  }

  async function loadFirebase() {
    const base = `https://www.gstatic.com/firebasejs/${FB_VERSION}`;
    const [app, auth, fs] = await Promise.all([
      import(`${base}/firebase-app.js`),
      import(`${base}/firebase-auth.js`),
      import(`${base}/firebase-firestore.js`)
    ]);
    const a = app.initializeApp(cfg.FIREBASE);
    fb = { auth: auth.getAuth(a), db: fs.getFirestore(a), A: auth, F: fs };
  }

  async function loadMember(user) {
    const { db, F } = fb;
    const [snap, adminSnap, reviewSnap] = await Promise.all([
      F.getDoc(F.doc(db, "members", user.uid)),
      F.getDoc(F.doc(db, "admins", user.uid)).catch(() => null),
      F.getDoc(F.doc(db, "reviews", user.uid)).catch(() => null)
    ]);
    s.state = snap.exists() ? normalize(snap.data()) : blank();
    s.isAdmin = !!(adminSnap && adminSnap.exists());
    s.reviews = reviewSnap && reviewSnap.exists() ? reviewSnap.data() : {};
  }

  async function pushRemote() {
    if (!fb || !s.user || !s.state.profile) return;
    const { db, F } = fb;
    setSave("saving");
    try {
      await Promise.all([
        F.setDoc(F.doc(db, "members", s.user.uid), {
          profile: s.state.profile,
          progress: s.state.progress,
          email: s.user.email || "",
          updatedAt: F.serverTimestamp()
        }),
        F.setDoc(F.doc(db, "leaderboard", s.user.uid), {
          ...s.summarize(s.state),
          updatedAt: F.serverTimestamp()
        })
      ]);
      setSave("saved");
    } catch (e) {
      console.error(e);
      setSave("error");
    }
  }

  function persist() {
    if (s.mode === "local") { writeLocal(); setSave("saved"); return; }
    setSave("saving");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(pushRemote, 900);
  }

  return {
    get mode() { return s.mode; },
    get ready() { return s.ready; },
    get user() { return s.user; },
    get isAdmin() { return s.isAdmin; },
    get state() { return s.state; },
    get reviews() { return s.reviews; },
    get saveState() { return s.saveState; },
    subscribe(fn) { s.listeners.add(fn); return () => s.listeners.delete(fn); },
    setSummarizer(fn) { s.summarize = fn; },

    async init() {
      if (s.mode === "local") {
        s.state = readLocal();
        s.isAdmin = lsGet(LS_ADMIN, 0) === 1;
        s.ready = true;
        emit();
        return;
      }
      try {
        await loadFirebase();
      } catch (e) {
        console.error("Firebase failed to load; falling back to local mode.", e);
        s.mode = "local";
        s.state = readLocal();
        s.ready = true;
        emit();
        return;
      }
      await new Promise((resolve) => {
        fb.A.onAuthStateChanged(fb.auth, async (user) => {
          s.user = user;
          if (user) {
            try { await loadMember(user); }
            catch (e) { console.error(e); s.state = blank(); }
          } else {
            s.state = blank(); s.isAdmin = false; s.reviews = {};
          }
          s.ready = true;
          emit();
          resolve();
        });
      });
    },

    async signIn() {
      const provider = new fb.A.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await fb.A.signInWithPopup(fb.auth, provider);
    },
    async signOut() {
      if (fb) await fb.A.signOut(fb.auth);
    },

    update(mutator) {
      mutator(s.state.progress, s.state);
      const t = today();
      s.state.progress.activity[t] = (s.state.progress.activity[t] || 0) + 1;
      persist();
      emit();
    },
    saveProfile(profile) {
      s.state.profile = { ...(s.state.profile || {}), ...profile, updatedAt: new Date().toISOString() };
      if (!s.state.profile.registeredAt) s.state.profile.registeredAt = new Date().toISOString();
      if (!s.state.progress.career && profile.goal) s.state.progress.career = profile.goal;
      persist();
      emit();
    },

    async leaderboard() {
      if (s.mode === "local") return [{ uid: "me", me: true, ...s.summarize(s.state) }];
      const { db, F } = fb;
      const snap = await F.getDocs(F.query(F.collection(db, "leaderboard"), F.orderBy("xp", "desc"), F.limit(100)));
      return snap.docs.map((d) => ({ uid: d.id, me: d.id === s.user?.uid, ...d.data() }));
    },
    async allMembers() {
      if (s.mode === "local") {
        return s.state.profile ? [{ uid: "local", ...s.state, email: s.state.profile.email }] : [];
      }
      const { db, F } = fb;
      const [m, r] = await Promise.all([
        F.getDocs(F.collection(db, "members")),
        F.getDocs(F.collection(db, "reviews"))
      ]);
      const reviews = Object.fromEntries(r.docs.map((d) => [d.id, d.data()]));
      return m.docs.map((d) => ({ uid: d.id, ...normalize(d.data()), email: d.data().email, updatedAt: d.data().updatedAt?.toDate?.(), reviews: reviews[d.id] || {} }));
    },
    async review(uid, moduleId, status, feedback) {
      if (s.mode === "local") throw new Error("Reviews need Firebase mode.");
      const { db, F } = fb;
      await F.setDoc(F.doc(db, "reviews", uid), {
        [moduleId]: { status, feedback, by: s.user.email || "", at: new Date().toISOString() }
      }, { merge: true });
    },

    // ----- Learners of the Week -----
    async spotlights() {
      const list = s.mode === "local"
        ? Object.values(lsGet(LS_SPOT, {}))
        : (await fb.F.getDocs(fb.F.collection(fb.db, "spotlights"))).docs.map((d) => d.data());
      return list.sort((a, b) => b.week - a.week);
    },
    async publishSpotlight(spot) {
      if (s.mode === "local") { const all = lsGet(LS_SPOT, {}); all[spot.id] = spot; lsSet(LS_SPOT, all); return; }
      await fb.F.setDoc(fb.F.doc(fb.db, "spotlights", spot.id), spot);
    },
    async removeSpotlight(id) {
      if (s.mode === "local") { const all = lsGet(LS_SPOT, {}); delete all[id]; lsSet(LS_SPOT, all); return; }
      await fb.F.deleteDoc(fb.F.doc(fb.db, "spotlights", id));
    },

    // ----- Certificates -----
    async certificates(uid) {
      if (s.mode === "local") return Object.values(lsGet(LS_CERT, {})).filter((c) => !uid || c.uid === uid);
      const { db, F } = fb, col = F.collection(db, "certificates");
      const snap = await F.getDocs(uid ? F.query(col, F.where("uid", "==", uid)) : col);
      return snap.docs.map((d) => d.data());
    },
    async certificate(id) {
      if (s.mode === "local") return lsGet(LS_CERT, {})[id] || null;
      const snap = await fb.F.getDoc(fb.F.doc(fb.db, "certificates", id));
      return snap.exists() ? snap.data() : null;
    },
    async issueCertificate(cert) {
      if (s.mode === "local") { const all = lsGet(LS_CERT, {}); all[cert.id] = cert; lsSet(LS_CERT, all); return; }
      await fb.F.setDoc(fb.F.doc(fb.db, "certificates", cert.id), cert);
    },
    async revokeCertificate(id) {
      if (s.mode === "local") { const all = lsGet(LS_CERT, {}); delete all[id]; lsSet(LS_CERT, all); return; }
      await fb.F.deleteDoc(fb.F.doc(fb.db, "certificates", id));
    },

    exportJSON() { return JSON.stringify(s.state, null, 2); },
    importJSON(obj) { s.state = normalize(obj); persist(); emit(); },
    resetLocal() {
      s.state = blank();
      try { localStorage.removeItem(LS_KEY); } catch {}
      emit();
    }
  };
})();
