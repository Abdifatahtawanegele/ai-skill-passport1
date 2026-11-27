# AI Skill Passport

**PLP–ILO Mini-Hackathon 2026 · Track 1: Credential Recognition & Skills Validation (SDGs 4 & 8)**
Theme: *Unlocking Displaced Talent: Pathways for Skilled Refugees*

AI Skill Passport turns one GitHub project into a **shareable, evidence-linked skills passport**. Every skill is tied to the file, dependency or commit that shows it. Claims without evidence stay labelled "self-reported", and nothing is invented.

> **Live app:** `https://YOUR-APP-URL` (replace after deploying)

## The problem

Many displaced developers and data analysts lost their transcripts, or hold degrees that take months to recognise. Employers still need confidence that a candidate can do the job. A public project *is* evidence, but it's hard for a recruiter to read, and anyone can claim any skill on a CV.

## What it does (MVP: profile + GitHub URL + skills report + shareable passport)

1. **Profile**: name, target role, GitHub username, location, languages, the kind of work wanted, optional contact.
2. **Skills**: pick up to 12 of 44 catalogued skills and rate yourself.
3. **Project**: one public repo, a live demo, the problem it solves and *your* contribution.
4. **Analyse**: the app reads public GitHub data in the browser (language stats, file list, contributors, dependency manifests, README) and maps signals to skills:
   - **Strong evidence**: two or more kinds of signal (e.g. `react` dependency + `.jsx` files)
   - **Evidence found**: one signal
   - **Self-reported · not shown in this project**: claimed, but this repo doesn't show it
   - **Discovered**: skills the evidence shows but the candidate didn't claim
   - **Authorship check**: the candidate's commits as a share of the history (owner / main contributor / partial / not found)
   - **Evidence score (0–100)** with a visible breakdown, plus **flags** (fork, few commits, unverified author…)
5. **Share**: a passport link (the data is encoded in the URL fragment, so no server stores it), print/PDF and JSON export.
   **Employers can click "Re-check evidence live"** to re-run the analysis against GitHub and confirm the link hasn't been altered or gone out of date.

## Trust & safety (from the build guide's "AI should assist, not invent" principle)

- **Evidence-linked outputs:** every skill result lists its evidence, and each item links to the exact place in the repository.
- **No invented claims:** the analyser is rule-based and explainable. The summary is assembled only from verified facts, with no generative text.
- **Safe integrations:** only public metadata and text files are read. Code is never downloaded in full or run, and no tokens or API keys are needed.
- **Privacy by design:** no accounts and no backend. The passport is stored in the user's browser, and share links carry the data after `#`, which browsers never send to the server.
- **Honest limits:** every passport says it is *not* an official qualification or certification, and that a repository can't prove who typed the code.
- **Accessible:** keyboard-friendly controls, visible focus, ARIA labels, mobile-responsive, print stylesheet.

## How it meets the five benchmarks

| Benchmark | How AI Skill Passport addresses it |
|---|---|
| 1. Credential & skills verification | Skills shown through linked repository evidence, even when paper records are missing |
| 2. Access & compliance readiness | A portable, printable, re-checkable record for job applications and onboarding |
| 3. Practical & market fit | Employer view: skills by evidence level, authorship, live demo, score breakdown |
| 4. Social & SDG impact | SDG 4 (skills recognition) and SDG 8 (decent work) for displaced tech talent |
| 5. Sustainability & scalability | No server, database or keys to maintain. The skill catalog lives in one file, and any cohort can use it free |

## Tech stack

- **React 18 + Vite 5**: JavaScript, HTML, CSS (no UI library)
- GitHub REST API + raw.githubusercontent.com (public, unauthenticated, CORS-enabled)
- Pure-JS analyser (`src/engine/analyze.js`) with 13 automated tests

```
ai-skill-passport/
├── index.html
├── src/
│   ├── App.jsx, main.jsx, styles.css, storage.js
│   ├── components/  Home, Builder, Passport, PassportView, SharedPassport, Method
│   ├── engine/
│   │   ├── skills.js    ← skill catalog: signals that count as evidence
│   │   ├── analyze.js   ← evidence analyser, score, flags, summary
│   │   ├── github.js    ← public GitHub fetcher (4 API calls per analysis)
│   │   └── share.js     ← passport ⇄ share-link encoding
│   └── data/demos.js    ← fictional demo candidates with offline snapshots
├── tests/analyze.test.js
└── .github/workflows/deploy.yml   ← GitHub Pages auto-deploy
```

## Run locally

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # 13 analyser tests
npm run build   # production build in dist/
```

## Deploy

**Vercel:** push to GitHub → vercel.com → *Add New Project* → import repo → Framework **Vite** → Deploy.
**GitHub Pages:** push to `main` → **Settings → Pages → Source: GitHub Actions**. The included workflow tests, builds and publishes.

## Known limits

- Unauthenticated GitHub access allows 60 requests per hour per network, which is about 15 analyses. The two demo passports use saved snapshots, so the live demo never depends on GitHub.
- Private repositories can't be analysed.
- One project shows only part of a person's skills.

## Roadmap

- Several projects per passport, and GitLab/Bitbucket support
- Mentor review: a signed endorsement from a verified mentor or employer, added to the passport
- Optional sign-in (Supabase) for higher GitHub limits and a short share URL
- Link with Track 3 matching: compare passport skills to job requirements, with match reasons
- Kiswahili, French, Arabic and Somali interface

---
Demo candidates (Amani, Yusuf) and their repositories are fictional.
Built for the PLP–ILO Mini-Hackathon (Power Learn Project × ILO PROSPECTS · #1MillionDevs4Africa).
