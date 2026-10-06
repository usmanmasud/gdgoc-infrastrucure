# InfraTrack — GDGoC BUK Infrastructure Cluster

**Cloud & DevOps Fundamentals · Second Semester · 8 October – 10 December 2026**
Google Developer Groups on Campus, Bayero University Kano · Led by Usman Masud Aliyu, Infrastructure Cluster Lead

InfraTrack is the cluster's learning system for this semester. Members register, follow a 10-week roadmap, tick off hands-on labs, practise in a simulated terminal, keep a learning journal, submit project milestones and plan their career track. Leads get a dashboard of every registration with progress, submissions to review and a CSV export.

---

## The semester plan

Last semester covered orientation, the intro to Cloud & DevOps, and Linux fundamentals. This semester builds on that and ends on **Demo Day, Thursday 10 December**. Sessions run every **Thursday**, and each one adds a layer to one continuous project, **CampusBoard** (a small campus events app).

| Week | Date | Module | CampusBoard milestone |
|---|---|---|---|
| 1 | Thu 8 Oct | Reboot: Linux Refresher & Bash Scripting | Repo with `backup.sh` + `sysreport.sh` |
| 2 | Thu 15 Oct | Networking for Cloud Engineers | Static site served by NGINX |
| 3 | Thu 22 Oct | Git & GitHub Collaboration | Clean history, README, merged PRs |
| 4 | Thu 29 Oct | Containers with Docker | Runs anywhere with `docker run` |
| 5 | Thu 5 Nov | Multi-Service Apps with Docker Compose | Frontend + API + Postgres via Compose |
| 6 | Thu 12 Nov | Google Cloud I: Core Infrastructure | Live on Google Cloud (VM / Cloud Storage) |
| 7 | Thu 19 Nov | Google Cloud II: Serverless, Data & the AWS Map | Cloud Run + Cloud SQL, AWS mapping |
| 8 | Thu 26 Nov | Automation: CI/CD & Infrastructure as Code | Auto-deploy on every push; Terraform |
| 9 | Thu 3 Dec | Capstone Sprint & Career Launch | Team capstone deployed publicly |
| 10 | Thu 10 Dec | **Demo Day & Graduation** | Final submission + reflection |

**Principles** (carried over from the original outline):
- Google Cloud first (~70%), AWS mapped for industry exposure (~25%), Azure awareness (~5%).
- 20–30% theory, 70–80% hands-on in every session.
- One continuous project instead of scattered exercises.
- Fundamentals first. Kubernetes, advanced Terraform and observability come next semester and through each member's career track.

Every module in the app has objectives, topics, 6–7 labs, a challenge, a project milestone with a submission form, a 5-question quiz and curated resources. All of this lives in [`site/js/data.js`](site/js/data.js).

### What members get

| Feature | What it does |
|---|---|
| **Registration** | Name, reg no, email, phone, faculty, department, level, semester, gender, last-semester attendance, laptop/OS, Linux comfort (1–5), prior experience, GitHub, LinkedIn, career goal, weekly hours, goals, notes, consent |
| **Dashboard** | Overall progress, XP, streak, hours this week vs their goal, this week's labs, next session countdown, badges |
| **Roadmap & modules** | Tickable labs, challenge, milestone submission, quiz with explanations, resources |
| **Practice** | 55 terminal drills (Linux, networking, Git, Docker, gcloud, Terraform), mixed quizzes, flashcards (incl. GCP↔AWS↔Azure map), 20 interview questions with model answers |
| **Journal** | Daily entries (minutes, module, what I learned, blockers) and a semester activity heatmap |
| **Career** | 6 tracks (Cloud Engineer, DevOps, SRE, Cloud Security, Builder, Exploring) with roles, skills, a 5-step plan for after 10 Dec and certifications |
| **Leaderboard** | Ranked by XP (labs, quizzes, milestones, drills, journaling) |
| **Resources** | Setup checklist, cloud concept map, community activities, curated links |

**XP:** lab 10 · quiz 10 per correct answer (best score) · milestone 30 · drill 5 (2 if the answer was revealed) · journal day 5 · setup item 5 · flashcard 2 · interview answer 3. There are 15 badges.

### What leads get (Admin page)
- Registered count, members active in the last 7 days, average progress, submissions awaiting review
- Breakdowns by level, career goal, laptop and last-semester attendance (useful for planning labs and pairing)
- A searchable member table with full registration details
- Mentor reviews on each milestone (Approved / Excellent / Needs work + feedback), which the member sees on the module page
- CSV export (opens in Excel or Google Sheets)

---

## Run it locally

No build step and no dependencies. Open `site/index.html` in a browser, or serve the folder:

```bash
cd site
python -m http.server 8080   # then open http://localhost:8080
```

By default it runs in **local mode**: each member's data stays in their own browser, and they can export/import a backup from the Profile page. That's fine for trying it out, but **for the cluster, use Firebase mode** so registrations are collected centrally.

## Deploy on GitHub Pages

1. Push this repo to GitHub.
2. Open **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`. The workflow in [`.github/workflows/pages.yml`](.github/workflows/pages.yml) checks the JavaScript and publishes `site/`. The URL appears in the Actions run, e.g. `https://<user>.github.io/gdgoc-infrastrucure/`.

## Connect Firebase (central registrations, leaderboard, admin)

Firebase's free Spark plan is enough.

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. **Build → Authentication → Get started → Sign-in method → Google → Enable.**
   Under **Settings → Authorized domains**, add your Pages domain (e.g. `<user>.github.io`).
3. **Build → Firestore Database → Create database** (production mode, a nearby region).
   Open the **Rules** tab, paste [`firestore.rules`](firestore.rules) and click **Publish**.
4. **Project settings → Your apps → Web (`</>`)** → register an app, copy the `firebaseConfig` object, and paste it as `FIREBASE` in [`site/js/config.js`](site/js/config.js).
5. Deploy. Members now click **Continue with Google**, register once, and their progress syncs across devices.
6. **Make yourself an admin:** sign in, open **Profile**, copy your *Member ID*. In Firestore, create the collection `admins` with a document whose ID is that Member ID (any field, e.g. `name: "Usman"`). Reload, and **Admin** appears in the menu. Repeat for co-leads and mentors.

> The Firebase web config is not a secret. Access is controlled by `firestore.rules`: members can only read and write their own records, only admins can read all registrations, and the leaderboard shows no contact details.

## Customise

| What | Where |
|---|---|
| Dates, lead name, session note, community link | `PROGRAM` in `site/js/config.js` |
| Modules, labs, quizzes, resources | `modules` in `site/js/data.js` |
| Drills, flashcards, interview questions | `drills`, `cards`, `interview` in `site/js/data.js` |
| Career tracks | `careers` in `site/js/data.js` |
| Colours & layout | `site/css/styles.css` (GDG palette tokens at the top) |

> Lab progress is stored by position. Mid-semester, **add** labs at the end of a module's list rather than reordering or deleting them.

## Project structure

```
site/
  index.html        app shell
  css/styles.css    GDG theme, light & dark
  js/config.js      program settings + Firebase config
  js/data.js        curriculum and practice content
  js/store.js       storage (localStorage or Firebase)
  js/app.js         views, routing, progress & XP logic
  assets/           favicon
firestore.rules     Firestore security rules
.github/workflows/  GitHub Pages deployment
```
