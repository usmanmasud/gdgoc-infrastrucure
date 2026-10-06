/*
 * InfraTrack configuration.
 *
 * LOCAL MODE (default): leave FIREBASE as null. Every member's progress is saved
 * in their own browser. Good for trying the site out; registrations are NOT
 * collected centrally.
 *
 * CLOUD MODE (recommended for the cluster): create a free Firebase project,
 * enable Google sign-in + Firestore, and paste the web app config below.
 * See README.md → "Connect Firebase".
 */
window.InfraConfig = {
  FIREBASE: {
    apiKey: "AIzaSyCiLxntzxHWfn4FF3aUBCLC09jr5Xvo8Vs",
    authDomain: "gdgoc-c9e08.firebaseapp.com",
    projectId: "gdgoc-c9e08",
    storageBucket: "gdgoc-c9e08.firebasestorage.app",
    messagingSenderId: "229536394063",
    appId: "1:229536394063:web:df4270525415d4a0c8333a"
  },

  // Shown on the site. Change freely.
  PROGRAM: {
    name: "InfraTrack",
    chapter: "Google Developer Groups on Campus — Bayero University Kano",
    short: "GDGoC BUK",
    cluster: "Infrastructure Cluster",
    track: "Cloud & DevOps Fundamentals",
    term: "Second Semester",
    lead: "Usman Masud Aliyu",
    leadRole: "Infrastructure Cluster Lead",
    start: "2026-10-06",
    end: "2026-12-10",
    sessionNote: "Weekly session every Thursday. Time & venue are announced in the cluster channel.",
    community: "" // e.g. WhatsApp/Discord invite link
  }
};
