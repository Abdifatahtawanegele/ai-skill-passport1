// Run with: npm test. Plain Node assertions, no test framework needed.
import assert from 'node:assert/strict';
import { analyze, parseDeps, contributionFor, summarise } from '../src/engine/analyze.js';
import { parseRepoUrl } from '../src/engine/github.js';
import { DEMOS } from '../src/data/demos.js';

let passed = 0;
const t = (name, fn) => { fn(); passed++; console.log('  ✓', name); };
const amani = DEMOS.find((d) => d.key === 'amani');
const yusuf = DEMOS.find((d) => d.key === 'yusuf');
const run = (d, over = {}) => analyze(d.snapshot, { claimed: d.passport.skills, username: d.passport.profile.github, ...over });

console.log('AI Skill Passport analyser tests');

t('parses GitHub URLs in several forms', () => {
  assert.deepEqual(parseRepoUrl('https://github.com/plp/app'), { owner: 'plp', repo: 'app' });
  assert.deepEqual(parseRepoUrl('github.com/plp/app.git/'), { owner: 'plp', repo: 'app' });
  assert.deepEqual(parseRepoUrl('plp/my-app'), { owner: 'plp', repo: 'my-app' });
  assert.equal(parseRepoUrl('https://gitlab.com/x/y'), null);
});

t('parses npm, pip and pyproject manifests', () => {
  const d = parseDeps({
    'package.json': '{"dependencies":{"react":"1"},"devDependencies":{"jest":"1"}}',
    'requirements.txt': 'pandas==2.0\nscikit-learn>=1.3 ; python_version>"3"\n# comment',
    'pyproject.toml': 'dependencies = ["fastapi>=0.1", "sqlalchemy"]',
  });
  ['react', 'jest', 'pandas', 'scikit-learn', 'fastapi', 'sqlalchemy'].forEach((x) => assert.ok(d.has(x), x));
});

t('ignores malformed manifests instead of guessing', () => {
  assert.equal(parseDeps({ 'package.json': '{not json' }).size, 0);
});

t('full-stack demo: React, Supabase, testing strongly evidenced; authorship verified', () => {
  const a = run(amani);
  const lvl = (id) => a.skills.find((s) => s.id === id)?.level;
  assert.equal(lvl('react'), 'strong');
  assert.equal(lvl('testing'), 'strong');
  assert.ok(['strong', 'evidenced'].includes(lvl('supabase')));
  assert.equal(a.contribution.status, 'verified');
  assert.ok(a.score >= 75, `score ${a.score}`);
});

t('claimed skill with no signal is reported honestly as not found', () => {
  const a = run(amani);
  assert.equal(a.skills.find((s) => s.id === 'typescript').level, 'not_found');
  assert.ok(a.flags.some((f) => f.includes('TypeScript')));
});

t('discovers unclaimed skills (e.g. SQL, CI/CD) from evidence', () => {
  const a = run(amani);
  const sql = a.skills.find((s) => s.id === 'sql');
  const ci = a.skills.find((s) => s.id === 'ci');
  assert.ok(sql && !sql.claimed && sql.level !== 'not_found');
  assert.ok(ci && !ci.claimed);
});

t('data demo: pandas/viz evidenced, ML claimed but not found', () => {
  const a = run(yusuf);
  const lvl = (id) => a.skills.find((s) => s.id === id)?.level;
  assert.equal(lvl('data'), 'strong');
  assert.notEqual(lvl('dataviz'), 'not_found');
  assert.equal(lvl('ml'), 'not_found');
  assert.ok(a.score < run(amani).score);
});

t('wrong username → authorship unverified and flagged', () => {
  const a = run(amani, { username: 'someone-else' });
  assert.equal(a.contribution.status, 'unverified');
  assert.ok(a.flags.some((f) => f.includes('not found among the contributors')));
});

t('minor contributor is partial, not verified', () => {
  const c = contributionFor(amani.snapshot, 'joseph-demo');
  assert.equal(c.status, 'partial');
  assert.equal(c.commits, 12);
});

t('fork is flagged', () => {
  const snap = { ...amani.snapshot, meta: { ...amani.snapshot.meta, fork: true } };
  assert.ok(analyze(snap, { claimed: [], username: 'amani-demo' }).flags.some((f) => f.includes('fork')));
});

t('every evidence item has a link and a description', () => {
  for (const d of DEMOS) for (const s of run(d).skills) for (const e of s.evidence) {
    assert.ok(e.url?.startsWith('https://github.com/'), `${s.id} url`);
    assert.ok(e.text.length > 5);
  }
});

t('score breakdown adds up and never exceeds 100', () => {
  for (const d of DEMOS) {
    const a = run(d);
    assert.equal(a.score, a.breakdown.reduce((x, b) => x + b.got, 0));
    assert.ok(a.score <= 100 && a.breakdown.every((b) => b.got <= b.max));
  }
});

t('summary only mentions skills that have evidence', () => {
  const a = run(yusuf);
  const s = summarise(yusuf.passport.profile, yusuf.passport.project, a);
  assert.ok(!s.includes('Machine learning'));
  assert.ok(s.includes('Dadaab Market Price Tracker'));
});

console.log(`\n${passed} tests passed`);
