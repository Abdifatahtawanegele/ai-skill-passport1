import { useState } from 'react';
import { SKILLS, CATEGORIES, SKILL_BY_ID, SELF_LEVELS } from '../engine/skills.js';
import { fetchSnapshot, parseRepoUrl } from '../engine/github.js';
import { analyze, summarise } from '../engine/analyze.js';
import { DEMOS } from '../data/demos.js';

const STEPS = ['Profile', 'Skills', 'Project', 'Analyse'];
const GOALS = [
  { id: 'local', label: 'Local job in Kenya' },
  { id: 'remote', label: 'Remote work' },
  { id: 'freelance', label: 'Freelance / contracts' },
  { id: 'fellowship', label: 'Fellowship / returnship' },
  { id: 'mentor', label: 'Find a mentor' },
];
const MAX_SKILLS = 12;

function Field({ label, hint, htmlFor, children }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export default function Builder({ initial, onDone, onCancel }) {
  const [p, setP] = useState(initial);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  const setProfile = (k, v) => setP((x) => ({ ...x, profile: { ...x.profile, [k]: v }, ...(k === 'github' ? { analysis: null } : {}) }));
  const setProject = (k, v) => setP((x) => ({ ...x, project: { ...x.project, [k]: v }, ...(k === 'repoUrl' ? { analysis: null } : {}) }));
  const pr = p.profile, pj = p.project;

  function toggleSkill(id) {
    setP((x) => {
      const has = x.skills.some((s) => s.id === id);
      if (!has && x.skills.length >= MAX_SKILLS) return x;
      return { ...x, skills: has ? x.skills.filter((s) => s.id !== id) : [...x.skills, { id, level: 'working' }], analysis: null };
    });
  }
  const setLevel = (id, level) => setP((x) => ({ ...x, skills: x.skills.map((s) => (s.id === id ? { ...s, level } : s)) }));

  function validate(s) {
    const e = [];
    if (s === 0) {
      if (!pr.name.trim()) e.push('Add your name (a first name is fine).');
      if (!pr.headline.trim()) e.push('Add the role you are aiming for, e.g. “Junior frontend developer”.');
      if (pr.github && !/^[A-Za-z0-9-]{1,39}$/.test(pr.github.trim())) e.push('A GitHub username has only letters, numbers and dashes (no @ or URL).');
    }
    if (s === 1 && p.skills.length === 0) e.push('Choose at least one skill.');
    if (s === 2) {
      if (!pj.title.trim()) e.push('Give your project a title.');
      if (!parseRepoUrl(pj.repoUrl)) e.push('Add a public GitHub repository URL, e.g. https://github.com/you/project.');
      if (pj.demoUrl && !/^https?:\/\/\S+\.\S+/.test(pj.demoUrl)) e.push('The live demo URL should start with https://');
    }
    setErrors(e);
    return e.length === 0;
  }
  const next = () => validate(step) && setStep(step + 1);

  async function runAnalysis() {
    setBusy(true);
    setFetchError(null);
    setProgress([]);
    try {
      const demo = DEMOS.find((d) => d.key === p.demoKey && d.passport.project.repoUrl === pj.repoUrl);
      let snap;
      if (demo) {
        setProgress(['Using saved demo snapshot (offline)']);
        snap = demo.snapshot;
      } else {
        snap = await fetchSnapshot(pj.repoUrl, { onStep: (s) => setProgress((x) => [...x, s]) });
      }
      const analysis = analyze({ ...snap, liveDemo: pj.demoUrl }, { claimed: p.skills, username: pr.github.trim() });
      setP((x) => ({ ...x, analysis, summary: summarise(x.profile, x.project, analysis) }));
    } catch (e) {
      setFetchError(e.message || 'Analysis failed.');
    } finally {
      setBusy(false);
    }
  }

  function finish(selfReported = false) {
    for (const s of [0, 1, 2]) if (!validate(s)) return setStep(s);
    onDone(selfReported || !p.analysis ? { ...p, analysis: null, summary: '' } : { ...p, summary: summarise(p.profile, p.project, p.analysis) });
  }

  const a = p.analysis;

  return (
    <div className="page narrow">
      <div className="wizard-head">
        <h1>{initial.analysis || initial.profile.name ? 'Edit your passport' : 'Create your passport'}</h1>
        <ol className="stepper" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li key={s} className={i === step ? 'current' : i < step ? 'done' : ''}>
              <button type="button" onClick={() => (i <= step || validate(step)) && setStep(i)} aria-current={i === step ? 'step' : undefined}>
                <span className="dot">{i < step ? '✓' : i + 1}</span>{s}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {errors.length > 0 && <div className="alert" role="alert">{errors.map((x) => <p key={x}>{x}</p>)}</div>}

      <form className="card form" onSubmit={(e) => { e.preventDefault(); if (step < 3) next(); }}>
        {step === 0 && (
          <>
            <h2>Your profile</h2>
            <p className="muted">Only share what you are comfortable with. Contact details are optional and only appear on your shared link.</p>
            <div className="grid2">
              <Field label="Name *" htmlFor="name"><input id="name" value={pr.name} onChange={(e) => setProfile('name', e.target.value)} placeholder="e.g. Amina Hassan" /></Field>
              <Field label="Target role *" htmlFor="headline"><input id="headline" value={pr.headline} onChange={(e) => setProfile('headline', e.target.value)} placeholder="e.g. Junior full-stack developer" /></Field>
              <Field label="GitHub username" htmlFor="gh" hint="Used to confirm your commits in the project."><input id="gh" value={pr.github} onChange={(e) => setProfile('github', e.target.value.replace(/^@/, '').replace(/^https?:\/\/github\.com\//, ''))} placeholder="e.g. aminahassan" autoComplete="off" /></Field>
              <Field label="Location" htmlFor="loc"><input id="loc" value={pr.location} onChange={(e) => setProfile('location', e.target.value)} placeholder="e.g. Kakuma, Kenya" /></Field>
              <Field label="Years of experience" htmlFor="yrs"><input id="yrs" inputMode="numeric" value={pr.years} onChange={(e) => setProfile('years', e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} /></Field>
              <Field label="Languages you speak" htmlFor="langs"><input id="langs" value={pr.languages} onChange={(e) => setProfile('languages', e.target.value)} placeholder="e.g. English, Arabic, Swahili" /></Field>
            </div>
            <Field label="Short bio" htmlFor="bio" hint="2–3 sentences: your background and what you are good at.">
              <textarea id="bio" rows={3} maxLength={400} value={pr.bio} onChange={(e) => setProfile('bio', e.target.value)} />
            </Field>
            <Field label="I'm looking for">
              <div className="choices">
                {GOALS.map((g) => (
                  <label key={g.id} className={pr.goals.includes(g.id) ? 'choice on' : 'choice'}>
                    <input type="checkbox" checked={pr.goals.includes(g.id)} onChange={() => setProfile('goals', pr.goals.includes(g.id) ? pr.goals.filter((x) => x !== g.id) : [...pr.goals, g.id])} />
                    {g.label}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Contact (optional)" htmlFor="contact" hint="Email or LinkedIn URL. Leave it empty to stay private.">
              <input id="contact" value={pr.contact} onChange={(e) => setProfile('contact', e.target.value)} />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <h2>Skills you claim</h2>
            <p className="muted">Pick up to {MAX_SKILLS}. The analysis then checks which ones your project shows. It's fine if some aren't found: they stay labelled as self-reported.</p>
            {CATEGORIES.map((cat) => (
              <fieldset key={cat} className="skill-group">
                <legend>{cat}</legend>
                <div className="chips">
                  {SKILLS.filter((s) => s.cat === cat).map((s) => {
                    const on = p.skills.some((x) => x.id === s.id);
                    return (
                      <button type="button" key={s.id} className={on ? 'chip on' : 'chip'} aria-pressed={on} onClick={() => toggleSkill(s.id)}>
                        {on ? '✓ ' : '+ '}{s.name}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            {p.skills.length > 0 && (
              <div className="selected-skills">
                <h3>Rate yourself <span className="muted-sm">({p.skills.length}/{MAX_SKILLS})</span></h3>
                {p.skills.map((s) => (
                  <div key={s.id} className="level-row">
                    <span>{SKILL_BY_ID[s.id].name}</span>
                    <select aria-label={`Self-rated level for ${SKILL_BY_ID[s.id].name}`} value={s.level} onChange={(e) => setLevel(s.id, e.target.value)}>
                      {SELF_LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <h2>Your featured project</h2>
            <p className="muted">Pick the one project that best shows your skills. It must be in a public GitHub repository.</p>
            <div className="grid2">
              <Field label="Project title *" htmlFor="ptitle"><input id="ptitle" value={pj.title} onChange={(e) => setProject('title', e.target.value)} /></Field>
              <Field label="Team" htmlFor="team">
                <select id="team" value={pj.team} onChange={(e) => setProject('team', e.target.value)}>
                  {['Solo', 'Team of 2', 'Team of 3–5', 'Team of 6+'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <Field label="GitHub repository URL *" htmlFor="repo"><input id="repo" value={pj.repoUrl} onChange={(e) => setProject('repoUrl', e.target.value)} placeholder="https://github.com/you/project" autoComplete="off" /></Field>
            <Field label="Live demo URL" htmlFor="demo" hint="A working demo is strong evidence. Vercel, Netlify, GitHub Pages and Render links all work."><input id="demo" value={pj.demoUrl} onChange={(e) => setProject('demoUrl', e.target.value)} placeholder="https://…" /></Field>
            <Field label="What problem does it solve?" htmlFor="problem"><textarea id="problem" rows={2} maxLength={300} value={pj.problem} onChange={(e) => setProject('problem', e.target.value)} placeholder="e.g. Helps small traders in Dadaab track stock and sales." /></Field>
            <Field label="What did you personally build?" htmlFor="contrib" hint="Be specific. Employers value an honest description of your part."><textarea id="contrib" rows={2} maxLength={300} value={pj.contribution} onChange={(e) => setProject('contribution', e.target.value)} /></Field>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Analyse your evidence</h2>
            <p className="muted">
              We read <b>public</b> data from <code>{parseRepoUrl(pj.repoUrl) ? `${parseRepoUrl(pj.repoUrl).owner}/${parseRepoUrl(pj.repoUrl).repo}` : 'your repository'}</code>:
              languages, file list, dependency files, README and contributors. Your code is never run or stored.
            </p>
            {!a && !busy && (
              <button type="button" className="btn primary lg" onClick={runAnalysis}>Analyse repository</button>
            )}
            {(busy || progress.length > 0) && !a && (
              <ul className="progress-list" aria-live="polite">
                {progress.map((s, i) => <li key={s}>{busy && i === progress.length - 1 ? '⏳' : '✓'} {s}</li>)}
              </ul>
            )}
            {fetchError && (
              <div className="alert" role="alert">
                <p>{fetchError}</p>
                <div className="row-actions">
                  <button type="button" className="btn sm ghost" onClick={runAnalysis}>Try again</button>
                  <button type="button" className="btn sm ghost" onClick={() => finish(true)}>Continue with a self-reported passport</button>
                </div>
              </div>
            )}
            {a && (
              <div className="analysis-preview">
                <div className="score-big"><b>{a.score}</b><span>/100 · {a.band}</span></div>
                <ul className="preview-stats">
                  <li><b>{a.skills.filter((s) => s.claimed && s.level !== 'not_found').length}/{p.skills.length}</b> claimed skills backed by evidence</li>
                  <li><b>{a.skills.filter((s) => !s.claimed).length}</b> extra skills discovered</li>
                  <li><b>{a.contribution.label}</b></li>
                  <li><b>{a.repo.fileCount}</b> files · <b>{a.repo.totalCommits}</b> commits analysed</li>
                </ul>
                <button type="button" className="btn ghost sm" onClick={runAnalysis}>Re-run analysis</button>
              </div>
            )}
          </>
        )}

        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={() => (step === 0 ? onCancel() : setStep(step - 1))}>{step === 0 ? 'Cancel' : '← Back'}</button>
          {step < 3 && <button type="submit" className="btn primary">Continue →</button>}
          {step === 3 && <button type="button" className="btn primary" disabled={!a || busy} onClick={() => finish(false)}>Create my passport →</button>}
        </div>
      </form>
    </div>
  );
}
