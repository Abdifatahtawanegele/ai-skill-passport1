import { useState } from 'react';
import Passport from './Passport.jsx';
import { shareUrl, toShareable } from '../engine/share.js';
import { fetchSnapshot } from '../engine/github.js';
import { analyze, summarise } from '../engine/analyze.js';
import { downloadFile } from '../storage.js';

export default function PassportView({ passport, onEdit, onUpdate, onDelete }) {
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const link = shareUrl(passport);
  const isDemo = passport.analysis?.source === 'demo-snapshot';

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setMsg('Share link copied. Anyone with the link can view this passport.');
    } catch {
      setMsg('Copy failed. Select the link below and copy it manually.');
    }
  }

  async function reanalyse() {
    setBusy(true);
    setMsg('Re-analysing repository…');
    try {
      const snap = await fetchSnapshot(passport.project.repoUrl);
      const analysis = analyze({ ...snap, liveDemo: passport.project.demoUrl }, { claimed: passport.skills, username: passport.profile.github });
      onUpdate({ ...passport, analysis, summary: summarise(passport.profile, passport.project, analysis), updatedAt: new Date().toISOString() });
      setMsg('Updated with the latest repository data.');
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="owner-bar no-print">
        <div className="row-actions wrap">
          <button className="btn primary" onClick={copyLink}>Copy share link</button>
          <a className="btn ghost" href={link} target="_blank" rel="noopener noreferrer">Preview as employer ↗</a>
          <button className="btn ghost" onClick={() => window.print()}>Print / Save PDF</button>
          <button className="btn ghost" onClick={onEdit}>Edit</button>
          {!isDemo && <button className="btn ghost" onClick={reanalyse} disabled={busy}>{busy ? 'Analysing…' : 'Re-analyse'}</button>}
          <button className="btn ghost" onClick={() => downloadFile('skill-passport.json', JSON.stringify(toShareable(passport), null, 2))}>Download JSON</button>
          {confirmDelete ? (
            <>
              <button className="btn danger" onClick={onDelete}>Delete from this browser</button>
              <button className="btn ghost" onClick={() => setConfirmDelete(false)}>Keep</button>
            </>
          ) : (
            <button className="btn ghost" onClick={() => setConfirmDelete(true)}>Delete</button>
          )}
        </div>
        {msg && <p className="toast" role="status">{msg}</p>}
        <details className="link-box">
          <summary>Show share link</summary>
          <input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Share link" />
          <p className="hint">The passport is encoded in the link itself, after the #, and isn't stored on any server. Anyone with the link can view it. Editing your passport creates a new link.</p>
        </details>
        {isDemo && <p className="hint">This is a demo passport built from a saved snapshot of a fictional repository. Its links point to example URLs.</p>}
      </div>
      <Passport data={toShareable(passport)} />
    </div>
  );
}
