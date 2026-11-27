# Submission: PLP–ILO Mini-Hackathon (due 27 Nov 2026)

**Project name:** AI Skill Passport
**Track:** Track 1: Credential Recognition & Skills Validation (SDGs 4 & 8)
**Live app URL:** https://YOUR-APP-URL
**GitHub repository:** https://github.com/YOUR-USERNAME/ai-skill-passport

## Brief project summary

**Problem.** Skilled refugee developers and analysts often lose their certificates, or wait months for recognition. Employers can't easily verify what a candidate can actually do, so talented people are filtered out.

**Solution.** AI Skill Passport turns one public GitHub project into a shareable skills passport. The candidate claims skills. An automated evidence analyser reads the repository's languages, dependencies, files, README and commit history, then marks each skill as *strong evidence*, *evidence found* or *self-reported*, and links every item to the exact evidence. It also checks authorship (the candidate's share of commits), finds unclaimed skills, gives a transparent 0–100 evidence score with its breakdown, and flags limits (forks, few commits). Nothing is invented: the analyser is rule-based and explainable.

**Main workflow.** Profile → Skills → Project (GitHub + live demo + contribution) → Analyse → Passport. The candidate shares one link. An employer opens it, expands any skill to see its evidence, and clicks **Re-check evidence live** to confirm the passport matches the repository today.

**Technology.** React 18 + Vite (JavaScript, HTML, CSS). The public GitHub API is called from the browser, with no backend, database or API keys. Share links carry the passport in the URL fragment, so no server stores personal data. There are 13 automated tests.

**Impact.** It turns "no papers" into checkable proof of skill (SDG 4) and opens routes to remote, local and fellowship roles (SDG 8). It costs nothing to run and works for any cohort, and the skill catalog can be extended in one file.

## 2-minute demo script

1. **Problem (20s):** "Amani is a self-taught developer in Kakuma. No degree certificate, but she has built a real marketplace app. How does an employer trust her CV?"
2. **Passport (40s):** Home → *Amani K. (demo)*. Show the score ring (94), the summary, then expand **React** to see the dependency, files and language-share evidence with links. Point out **TypeScript: self-reported · not shown in this project**: honest, not inflated.
3. **Live analysis (30s):** *Create passport* → fill in the steps with a real public repo → **Analyse repository** → show the progress steps and result.
4. **Employer view (20s):** **Copy share link** → open it → **Re-check evidence live** → "✓ matches".
5. **Trust & scale (10s):** open *How it works* (signals, score, limits). "No server, no keys, free for every cohort."
