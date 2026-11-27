// Evidence analyser: pure function, no network. Input is a repository "snapshot"
// (metadata, language bytes, file paths, contributors, manifest texts, README) plus the
// candidate's claimed skills. Output is explainable: every skill level is backed by a list of
// evidence items that point to something real in the repository. Nothing is inferred without a signal.

import { SKILLS, SKILL_BY_ID } from './skills.js';

// --- manifest parsing -------------------------------------------------------
export function parseDeps(manifests = {}) {
  const deps = new Map(); // name -> manifest file
  const add = (name, file) => name && !deps.has(name.toLowerCase()) && deps.set(name.toLowerCase(), file);
  for (const [file, text] of Object.entries(manifests)) {
    if (!text) continue;
    const base = file.split('/').pop();
    try {
      if (base === 'package.json') {
        const j = JSON.parse(text);
        Object.keys({ ...j.dependencies, ...j.devDependencies, ...j.peerDependencies }).forEach((d) => add(d, file));
      } else if (base === 'composer.json') {
        const j = JSON.parse(text);
        Object.keys({ ...j.require, ...j['require-dev'] }).forEach((d) => add(d, file));
      } else if (base === 'requirements.txt') {
        text.split(/\r?\n/).forEach((l) => add(l.trim().split(/[<>=!~\[; ]/)[0], file));
      } else if (base === 'pyproject.toml') {
        (text.match(/["']([A-Za-z0-9_.-]+)\s*(?:[<>=!~][^"']*)?["']/g) || []).forEach((m) => add(m.replace(/["']/g, '').split(/[<>=!~ ]/)[0], file));
        (text.match(/^([A-Za-z0-9_.-]+)\s*=/gm) || []).forEach((m) => add(m.split('=')[0].trim(), file));
      } else if (base === 'pubspec.yaml') {
        if (/flutter:/i.test(text)) add('flutter', file);
        (text.match(/^\s{2}([a-z0-9_]+):/gm) || []).forEach((m) => add(m.trim().replace(':', ''), file));
      } else if (base === 'pom.xml' || /build\.gradle/.test(base)) {
        if (/spring-boot/i.test(text)) add('spring-boot', file);
      }
    } catch {
      /* malformed manifest: ignore, never guess */
    }
  }
  return deps;
}

// --- helpers ----------------------------------------------------------------
const blobUrl = (meta, path) => `${meta.html_url}/blob/${meta.default_branch}/${path}`;
const pct = (n) => Math.round(n * 100);

function languageShares(languages = {}) {
  const total = Object.values(languages).reduce((a, b) => a + b, 0) || 1;
  return Object.fromEntries(Object.entries(languages).map(([k, v]) => [k, v / total]));
}

export function contributionFor(snapshot, username) {
  const contributors = snapshot.contributors || [];
  const total = contributors.reduce((a, c) => a + (c.contributions || 0), 0);
  const u = (username || '').trim().toLowerCase();
  const owner = snapshot.meta.owner?.toLowerCase();
  if (!u) return { status: 'unknown', label: 'No GitHub username given', commits: null, share: null, total };
  const me = contributors.find((c) => c.login?.toLowerCase() === u);
  const commits = me?.contributions ?? 0;
  const share = total ? commits / total : 0;
  if (me && (owner === u || share >= 0.5)) return { status: 'verified', label: owner === u ? 'Repository owner & main contributor' : 'Main contributor', commits, share, total };
  if (me) return { status: 'partial', label: `Contributor (${pct(share)}% of commits)`, commits, share, total };
  if (owner === u) return { status: 'partial', label: 'Repository owner (no commits attributed to this username)', commits: 0, share: 0, total };
  return { status: 'unverified', label: 'Username not found among contributors', commits: 0, share: 0, total };
}

// --- main -------------------------------------------------------------------
export function analyze(snapshot, { claimed = [], username = '' } = {}) {
  const { meta, files = [], readme = '' } = snapshot;
  const shares = languageShares(snapshot.languages);
  const deps = parseDeps(snapshot.manifests);
  const contribution = contributionFor(snapshot, username);
  const claimedIds = new Set(claimed.map((c) => c.id));

  const results = [];
  for (const skill of SKILLS) {
    const evidence = [];
    // 1. language bytes
    for (const l of skill.lang || []) {
      if (shares[l] >= 0.02) evidence.push({ type: 'language', text: `${l} is ${pct(shares[l])}% of the code (GitHub language stats)`, weight: shares[l] >= 0.25 ? 2 : 1, url: `${meta.html_url}/search?l=${encodeURIComponent(l)}` });
    }
    // 2. dependencies
    for (const d of skill.deps || []) {
      if (deps.has(d)) evidence.push({ type: 'dependency', text: `Uses “${d}” (declared in ${deps.get(d)})`, weight: 1, url: blobUrl(meta, deps.get(d)) });
    }
    // 3. files
    const matched = (skill.files || []).flatMap((re) => files.filter((f) => re.test(f)));
    const uniq = [...new Set(matched)];
    if (uniq.length) {
      evidence.push({ type: 'files', text: `${uniq.length} matching file${uniq.length > 1 ? 's' : ''}, e.g. ${uniq.slice(0, 2).join(', ')}`, weight: uniq.length >= 3 ? 1 : 0.5, url: blobUrl(meta, uniq[0]) });
    }
    // 4. special skills
    if (skill.id === 'git' && contribution.commits) {
      evidence.push({ type: 'commits', text: `${contribution.commits} commit${contribution.commits > 1 ? 's' : ''} attributed to @${username}`, weight: contribution.commits >= 10 ? 2 : 1, url: `${meta.html_url}/commits?author=${encodeURIComponent(username)}` });
    }
    if (skill.id === 'docs' && readme) {
      const words = readme.split(/\s+/).filter(Boolean).length;
      const sections = (readme.match(/^#{1,3}\s+/gm) || []).length;
      const hasSetup = /(install|setup|getting started|usage|run locally|how to run)/i.test(readme);
      if (words >= 80) evidence.push({ type: 'readme', text: `README: ${words} words, ${sections} section${sections === 1 ? '' : 's'}${hasSetup ? ', includes setup/usage instructions' : ''}`, weight: words >= 250 && hasSetup ? 2 : 1, url: `${meta.html_url}#readme` });
    }

    const score = evidence.reduce((a, e) => a + e.weight, 0);
    const kinds = new Set(evidence.map((e) => e.type)).size;
    let level = 'none';
    if (score >= 2 && (kinds >= 2 || score >= 2.5)) level = 'strong';
    else if (score > 0) level = 'evidenced';

    const isClaimed = claimedIds.has(skill.id);
    if (!isClaimed && level === 'none') continue;
    results.push({
      id: skill.id,
      name: skill.name,
      cat: skill.cat,
      claimed: isClaimed,
      selfLevel: claimed.find((c) => c.id === skill.id)?.level || null,
      level: level === 'none' ? 'not_found' : level,
      evidence: evidence.sort((a, b) => b.weight - a.weight),
    });
  }

  // Order: claimed+strong first, then claimed+evidenced, discovered, then claimed-not-found.
  const rank = (s) => (s.level === 'strong' ? 0 : s.level === 'evidenced' ? 1 : 3) + (s.claimed ? 0 : 1.5);
  results.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));

  const claimedResults = results.filter((s) => s.claimed);
  const covered = claimedResults.filter((s) => s.level !== 'not_found').length;
  const practices = {
    readme: results.some((s) => s.id === 'docs' && s.level !== 'not_found'),
    tests: results.some((s) => s.id === 'testing' && s.level !== 'not_found'),
    ci: results.some((s) => s.id === 'ci' && s.level !== 'not_found'),
    description: !!meta.description,
    liveDemo: !!(snapshot.liveDemo || meta.homepage),
    license: !!meta.license,
  };

  // Transparent 0–100 evidence score with a visible breakdown.
  const breakdown = [
    { label: 'Claimed skills backed by evidence', got: claimedResults.length ? Math.round((covered / claimedResults.length) * 40) : 0, max: 40, note: `${covered}/${claimedResults.length} claimed skills found in the repository` },
    { label: 'Authorship', got: { verified: 25, partial: 12, unverified: 0, unknown: 0 }[contribution.status], max: 25, note: contribution.label },
    { label: 'Documentation (README)', got: practices.readme ? 10 : 0, max: 10, note: practices.readme ? 'README with real content' : 'No substantial README found' },
    { label: 'Working demo', got: practices.liveDemo ? 10 : 0, max: 10, note: practices.liveDemo ? 'Live demo URL provided' : 'No live demo URL' },
    { label: 'Automated tests', got: practices.tests ? 8 : 0, max: 8, note: practices.tests ? 'Test files or test framework present' : 'No tests detected' },
    { label: 'CI/CD or deployment config', got: practices.ci ? 4 : 0, max: 4, note: practices.ci ? 'Workflow or deploy config present' : 'None detected' },
    { label: 'Project description', got: practices.description ? 3 : 0, max: 3, note: meta.description ? 'GitHub description set' : 'No GitHub description' },
  ];
  const score = breakdown.reduce((a, b) => a + b.got, 0);

  const flags = [];
  if (meta.fork) flags.push('This repository is a fork. Some code may have been written by the original authors.');
  if (contribution.status === 'unverified') flags.push('The GitHub username was not found among the contributors. Authorship could not be checked.');
  if (snapshot.truncated) flags.push('The repository is very large, so only part of the file list was analysed.');
  if ((contribution.total || 0) < 5) flags.push('Fewer than 5 commits in total: limited history to assess.');
  const notFound = claimedResults.filter((s) => s.level === 'not_found');
  if (notFound.length) flags.push(`No evidence found in this project for: ${notFound.map((s) => s.name).join(', ')}. That doesn't mean the skill is missing, only that this project doesn't show it.`);

  return {
    skills: results,
    contribution,
    practices,
    breakdown,
    score,
    band: score >= 75 ? 'Strong evidence' : score >= 50 ? 'Good evidence' : score >= 25 ? 'Some evidence' : 'Limited evidence',
    flags,
    repo: {
      fullName: meta.full_name,
      url: meta.html_url,
      description: meta.description || '',
      stars: meta.stargazers_count || 0,
      createdAt: meta.created_at,
      pushedAt: meta.pushed_at,
      topLanguages: Object.entries(shares).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => ({ name: k, pct: pct(v) })),
      fileCount: files.length,
      totalCommits: contribution.total,
    },
    analysedAt: snapshot.fetchedAt || new Date().toISOString(),
    source: snapshot.demo ? 'demo-snapshot' : 'github-live',
  };
}

// Plain-language summary built only from verified facts (no generative text, so nothing is invented).
export function summarise(profile, project, a) {
  const strong = a.skills.filter((s) => s.level === 'strong').map((s) => s.name);
  const ev = a.skills.filter((s) => s.level === 'evidenced').map((s) => s.name);
  const who = profile.name?.trim() || 'This candidate';
  const parts = [];
  parts.push(`${who} built ${project.title ? `“${project.title}”` : 'this project'}${project.problem ? `, which ${project.problem.replace(/^[A-Z]/, (c) => c.toLowerCase()).replace(/\.$/, '')}` : ''}.`);
  if (strong.length) parts.push(`The repository shows strong evidence of ${listJoin(strong.slice(0, 5))}.`);
  if (ev.length) parts.push(`It also shows ${listJoin(ev.slice(0, 5))}.`);
  if (a.contribution.status === 'verified') parts.push(`GitHub records ${a.contribution.commits} commits by @${profile.github}, ${Math.round(a.contribution.share * 100)}% of the project's history.`);
  else if (a.contribution.status === 'partial') parts.push(`${a.contribution.label}.`);
  if (a.practices.tests || a.practices.ci) parts.push(`Engineering practice: ${[a.practices.tests && 'automated tests', a.practices.ci && 'CI/deployment configuration'].filter(Boolean).join(' and ')}.`);
  return parts.join(' ');
}

function listJoin(arr) {
  if (arr.length <= 1) return arr.join('');
  return `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`;
}

export function claimedFromIds(ids) {
  return ids.filter((id) => SKILL_BY_ID[id]).map((id) => ({ id, level: 'working' }));
}
