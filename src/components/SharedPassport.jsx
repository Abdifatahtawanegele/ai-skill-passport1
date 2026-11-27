import { useMemo, useState } from 'react';
import Passport from './Passport.jsx';
import { decodePassport } from '../engine/share.js';
import { fetchSnapshot } from '../engine/github.js';
import { analyze } from '../engine/analyze.js';

export default function SharedPassport({ code, onHome }) {
  const { data, error } = useMemo(() => {
    try {
      return { data: decodePassport(code) };
    } catch {
      return { error: true };
    }
  }, [code]);
  const [check, setCheck] = useState(null);

  if (error) {
    return (
      <div className="page narrow empty">
        <h1>This passport link can't be read</h1>
        <p className="muted">It may have been cut off when it was copied. Ask the candidate to send the full link again.</p>
        <button className="btn primary" onClick={onHome}>Go to AI Skill Passport</button>
      </div>
    );
  }

  const a = data.analysis;
  const canRecheck = a && a.source !== 'demo-snapshot';

  async function recheck() {
    setCheck({ state: 'busy' });
    try {
      const snap = await fetchSnapshot(data.project.repoUrl);
      const fresh = analyze({ ...snap, liveDemo: data.project.demoUrl }, { claimed: data.skills, username: data.profile.github });
      const diffs = [];
      if (fresh.score !== a.score) diffs.push(`score is now ${fresh.score} (link says ${a.score})`);
      if (fresh.contribution.status !== a.contribution.status) diffs.push(`authorship is now “${fresh.contribution.label}”`);
      const lv = (x) => Object.fromEntries(x.skills.map((s) => [s.id, s.level]));
      const before = lv(a), after = lv(fresh);
      const changed = Object.keys({ ...before, ...after }).filter((k) => before[k] !== after[k]);
      if (changed.length) diffs.push(`${changed.length} skill level${changed.length > 1 ? 's' : ''} differ`);
      setCheck({ state: diffs.length ? 'diff' : 'match', diffs });
    } catch (e) {
      setCheck({ state: 'error', msg: e.message });
    }
  }

  return (
    <div className="page">
      <div className="viewer-bar no-print">
        <div>
          <p className="eyebrow">Shared skill passport</p>
          <p className="muted">
            You're viewing a passport shared by the candidate. Its results come from an automated check of their public GitHub repository.
            {canRecheck && ' You can re-run the check live to confirm the link has not been altered and is up to date.'}
          </p>
        </div>
        <div className="row-actions wrap">
          {canRecheck && <button className="btn primary" onClick={recheck} disabled={check?.state === 'busy'}>{check?.state === 'busy' ? 'Checking GitHub…' : 'Re-check evidence live'}</button>}
          <button className="btn ghost" onClick={() => window.print()}>Print / Save PDF</button>
          <button className="btn ghost" onClick={onHome}>Create your own</button>
        </div>
        {check?.state === 'match' && <p className="toast good" role="status">✓ Live check matches this passport: same score, authorship and skill levels.</p>}
        {check?.state === 'diff' && <p className="toast warn" role="status">The live check differs: {check.diffs.join('; ')}. The repository may have changed since the passport was created.</p>}
        {check?.state === 'error' && <p className="toast warn" role="status">{check.msg}</p>}
      </div>
      <Passport data={data} />
    </div>
  );
}
