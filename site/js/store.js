/*
 * InfraTrack data layer.
 * - Local mode: one JSON blob in localStorage.
 * - Firebase mode: Google sign-in + Firestore
 *     members/{uid}      profile + progress (owner & admins can read)
 *     leaderboard/{uid}  public summary (any signed-in member can read)
 *     reviews/{uid}      admin feedback on submissions (admins write)
 *     admins/{uid}       existence = admin (create by hand in the console)
 */
window.InfraStore = (() => {
  const cfg = window.InfraConfig;
  const LS_KEY = "gdgoc-infra:v1";
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
    saveState: "idle",
    adminCheck: "",
    syncError: ""
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

  async function checkAdmin(uid) {
    const { db, F } = fb;
    try {
      const snap = await F.getDoc(F.doc(db, "admins", uid));
      s.isAdmin = snap.exists();
      s.adminCheck = snap.exists() ? "ok" : "missing";
    } catch (e) {
      s.isAdmin = false;
      s.adminCheck = `error: ${e.code || e.message}`;
    }
  }

  async function loadMember(user) {
    const { db, F } = fb;
    const [snap, reviewSnap] = await Promise.all([
      F.getDoc(F.doc(db, "members", user.uid)).catch((e) => { s.syncError = e.code || e.message; return null; }),
      F.getDoc(F.doc(db, "reviews", user.uid)).catch(() => null),
      checkAdmin(user.uid)
    ]);
    if (snap) s.syncError = "";
    s.state = snap && snap.exists() ? normalize(snap.data()) : blank();
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
      s.syncError = "";
      setSave("saved");
    } catch (e) {
      console.error(e);
      s.syncError = e.code || e.message;
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
    get adminCheck() { return s.adminCheck; },
    get syncError() { return s.syncError; },
    async recheckAdmin() { if (fb && s.user) { await checkAdmin(s.user.uid); emit(); } },
    subscribe(fn) { s.listeners.add(fn); return () => s.listeners.delete(fn); },
    setSummarizer(fn) { s.summarize = fn; },

    async init() {
      if (s.mode === "local") {
        s.state = readLocal();
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

    exportJSON() { return JSON.stringify(s.state, null, 2); },
    importJSON(obj) { s.state = normalize(obj); persist(); emit(); },
    resetLocal() {
      s.state = blank();
      try { localStorage.removeItem(LS_KEY); } catch {}
      emit();
    }
  };
})();
