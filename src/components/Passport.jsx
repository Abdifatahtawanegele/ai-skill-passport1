// Renders a passport. Used for the owner's view and the read-only shared link.
import { useState } from 'react';
import { SKILL_BY_ID, SELF_LEVELS } from '../engine/skills.js';
import { parseRepoUrl } from '../engine/github.js';

export const LEVEL_META = {
  strong: { label: 'Strong evidence', cls: 'strong' },
  evidenced: { label: 'Evidence found', cls: 'evidenced' },
  not_found: { label: 'Self-reported · not shown in this project', cls: 'nf' },
  self: { label: 'Self-reported', cls: 'nf' },
};
const GOAL_LABELS = { local: 'Local job in Kenya', remote: 'Remote work', freelance: 'Freelance', fellowship: 'Fellowship / returnship', mentor: 'Mentorship' };
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

function ScoreRing({ score, band }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <div className="score-ring" role="img" aria-label={`Evidence score ${score} out of 100: ${band}`}>
      <svg viewBox="0 0 80 80" width="96" height="96" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="8" />
        <circle cx="40" cy="40" r={r} fill="none" stroke="#E7A83E" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} transform="rotate(-90 40 40)" />
      </svg>
      <div><b>{score}</b><span>{band}</span></div>
    </div>
  );
}

function SkillRow({ s }) {
  const [open, setOpen] = useState(false);
  const meta = LEVEL_META[s.level];
  const self = SELF_LEVELS.find((l) => l.id === s.selfLevel)?.label;
  return (
    <li className={`skill-row ${meta.cls}`}>
      <button type="button" className="skill-head" aria-expanded={open} onClick={() => setOpen(!open)} disabled={!s.evidence?.length}>
        <span className="skill-name">
          <b>{s.name}</b>
          <small>{s.claimed ? `Claimed${self ? ` · ${self}` : ''}` : 'Discovered from evidence'}</small>
        </span>
        <span className={`lv ${meta.cls}`}>{meta.label}</span>
        {s.evidence?.length > 0 && <span className="chev" aria-hidden="true">{open ? '▴' : '▾'}</span>}
      </button>
      {open && (
        <ul className="evidence">
          {s.evidence.map((e, i) => (
            <li key={i}><a href={e.url} target="_blank" rel="noopener noreferrer">{e.text}</a></li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Passport({ data }) {
  const { profile: pr, project: pj, analysis: a } = data;
  const repo = parseRepoUrl(pj.repoUrl);
  const [imgOk, setImgOk] = useState(true);
  const skills = a
    ? a.skills
    : data.skills.map((s) => ({ id: s.id, name: SKILL_BY_ID[s.id]?.name || s.id, claimed: true, selfLevel: s.level, level: 'self', evidence: [] }));
  const claimed = skills.filter((s) => s.claimed);
  const discovered = skills.filter((s) => !s.claimed);
  const contact = pr.contact?.trim();
  const contactHref = contact && (/^https?:\/\//.test(contact) ? contact : /@/.test(contact) ? `mailto:${contact}` : null);

  return (
    <article className="passport">
      <header className="pp-band">
        <div className="pp-id">
          <p className="pp-kicker">SKILL PASSPORT{a?.source === 'demo-snapshot' ? ' · DEMO' : ''}</p>
          <h1>{pr.name || 'Candidate'}</h1>
          <p className="pp-headline">{pr.headline}</p>
          <p className="pp-meta">
            {[pr.location, pr.years && `${pr.years} yr${pr.years === '1' ? '' : 's'} experience`, pr.languages].filter(Boolean).join(' · ')}
          </p>
          <div className="pp-links">
            {pr.github && <a href={`https://github.com/${pr.github}`} target="_blank" rel="noopener noreferrer">github.com/{pr.github}</a>}
            {contact && (contactHref ? <a href={contactHref} target="_blank" rel="noopener noreferrer">{contact}</a> : <span>{contact}</span>)}
          </div>
        </div>
        {a ? <ScoreRing score={a.score} band={a.band} /> : <div className="self-badge">Self-reported<br /><small>not analysed</small></div>}
      </header>

      {(pr.bio || pr.goals?.length > 0) && (
        <div className="pp-intro">
          {pr.bio && <p>{pr.bio}</p>}
          {pr.goals?.length > 0 && <div className="goal-chips">{pr.goals.map((g) => <span key={g}>{GOAL_LABELS[g]}</span>)}</div>}
        </div>
      )}

      {data.summary && (
        <section className="pp-section summary">
          <h2>Evidence summary</h2>
          <p>{data.summary}</p>
        </section>
      )}

      <section className="pp-section project">
        <h2>Featured project</h2>
        <div className="project-card">
          {repo && imgOk && a?.source !== 'demo-snapshot' && (
            <img src={`https://opengraph.githubassets.com/1/${repo.owner}/${repo.repo}`} alt={`GitHub preview of ${repo.owner}/${repo.repo}`} onError={() => setImgOk(false)} loading="lazy" />
          )}
          <div>
            <h3>{pj.title}</h3>
            {pj.problem && <p><b>Problem solved:</b> {pj.problem}</p>}
            {pj.contribution && <p><b>My contribution:</b> {pj.contribution} <span className="muted-sm">({pj.team})</span></p>}
            {a && (
              <p className="tech">
                {a.repo.topLanguages.map((l) => <span key={l.name}>{l.name} {l.pct}%</span>)}
              </p>
            )}
            <div className="row-actions wrap">
              <a className="btn sm ghost" href={pj.repoUrl} target="_blank" rel="noopener noreferrer">GitHub repository ↗</a>
              {pj.demoUrl && <a className="btn sm primary" href={pj.demoUrl} target="_blank" rel="noopener noreferrer">Live demo ↗</a>}
            </div>
          </div>
        </div>
        {a && (
          <dl className="facts">
            <div><dt>Authorship</dt><dd className={`auth ${a.contribution.status}`}>{a.contribution.label}</dd></div>
            <div><dt>Commits</dt><dd>{a.contribution.commits ?? '—'} of {a.repo.totalCommits}</dd></div>
            <div><dt>Active</dt><dd>{fmtDate(a.repo.createdAt)} → {fmtDate(a.repo.pushedAt)}</dd></div>
            <div><dt>Files analysed</dt><dd>{a.repo.fileCount}</dd></div>
          </dl>
        )}
      </section>

      <section className="pp-section">
        <h2>Skills <small className="muted-sm">{a ? 'click a skill to see its evidence' : 'self-reported, not yet analysed'}</small></h2>
        <ul className="skills">{claimed.map((s) => <SkillRow key={s.id} s={s} />)}</ul>
        {discovered.length > 0 && (
          <>
            <h3 className="sub">Also shown by the evidence</h3>
            <ul className="skills">{discovered.map((s) => <SkillRow key={s.id} s={s} />)}</ul>
          </>
        )}
      </section>

      {a && (
        <div className="two-col pp-section">
          <section>
            <h2>How the score is built</h2>
            <ul className="breakdown">
              {a.breakdown.map((b) => (
                <li key={b.label}>
                  <div className="bd-top"><span>{b.label}</span><b>{b.got}/{b.max}</b></div>
                  <div className="meter"><i style={{ width: `${(b.got / b.max) * 100}%` }} /></div>
                  <small>{b.note}</small>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2>Keep in mind</h2>
            {a.flags.length ? <ul className="flags">{a.flags.map((f) => <li key={f}>{f}</li>)}</ul> : <p className="muted">No issues flagged.</p>}
          </section>
        </div>
      )}

      <footer className="pp-foot">
        <p>
          <b>Assessment status:</b>{' '}
          {a ? `Automated evidence check of ${a.repo.fullName} on ${fmtDate(a.analysedAt)}${a.source === 'demo-snapshot' ? ' (demo snapshot)' : ''}.` : 'Self-reported. No repository analysis yet.'}{' '}
          This is <b>not</b> an official qualification, certification or independent assessment. It shows what a public repository contains.
          It cannot prove who typed the code. Interview and test as you normally would.
        </p>
      </footer>
    </article>
  );
}
