import { useEffect, useState } from 'react';
import Home from './components/Home.jsx';
import Builder from './components/Builder.jsx';
import PassportView from './components/PassportView.jsx';
import SharedPassport from './components/SharedPassport.jsx';
import Method from './components/Method.jsx';
import { loadPassport, savePassport, emptyPassport } from './storage.js';
import { DEMOS } from './data/demos.js';
import { analyze, summarise } from './engine/analyze.js';

function readSharedCode() {
  const m = window.location.hash.match(/^#\/p\/([A-Za-z0-9_-]+)$/);
  return m ? m[1] : null;
}

export default function App() {
  const [sharedCode, setSharedCode] = useState(readSharedCode);
  const [passport, setPassport] = useState(loadPassport);
  const [view, setView] = useState('home');
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    savePassport(passport);
  }, [passport]);
  useEffect(() => {
    const onHash = () => setSharedCode(readSharedCode());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    // Braces matter: newer browsers return a Promise from scrollTo, which React would treat as a cleanup.
    window.scrollTo({ top: 0 });
  }, [view, sharedCode]);

  function go(v) {
    if (sharedCode) {
      history.pushState('', document.title, window.location.pathname + window.location.search);
      setSharedCode(null);
    }
    setView(v);
  }

  function startBuild(demoKey, { edit = false } = {}) {
    const demo = DEMOS.find((d) => d.key === demoKey);
    if (demo) {
      const base = emptyPassport();
      const p = { ...base, ...structuredClone(demo.passport), id: base.id, demoKey };
      const snap = { ...demo.snapshot, liveDemo: p.project.demoUrl };
      p.analysis = analyze(snap, { claimed: p.skills, username: p.profile.github });
      p.summary = summarise(p.profile, p.project, p.analysis);
      p.updatedAt = new Date().toISOString();
      setPassport(p);
      go('passport');
      return;
    }
    // "Create" after viewing a demo starts blank; "Edit" keeps the current passport.
    setDraft(passport && (edit || !passport.demoKey) ? structuredClone(passport) : emptyPassport());
    go('build');
  }

  function finishBuild(p) {
    setPassport({ ...p, demoKey: p.analysis?.source === 'demo-snapshot' ? p.demoKey : null, updatedAt: new Date().toISOString() });
    go('passport');
  }

  if (sharedCode) {
    return (
      <Shell view="shared" go={go} hasPassport={!!passport}>
        <SharedPassport code={sharedCode} onHome={() => go('home')} />
      </Shell>
    );
  }

  return (
    <Shell view={view} go={(v) => (v === 'build' ? startBuild() : go(v))} hasPassport={!!passport} isDemo={!!passport?.demoKey}>
      {view === 'home' && <Home onStart={startBuild} hasPassport={!!passport && !passport.demoKey} onOpen={() => go('passport')} />}
      {view === 'build' && draft && <Builder key={draft.id} initial={draft} onDone={finishBuild} onCancel={() => go(passport ? 'passport' : 'home')} />}
      {view === 'passport' && passport && (
        <PassportView
          passport={passport}
          onEdit={() => startBuild(undefined, { edit: true })}
          onUpdate={setPassport}
          onDelete={() => { setPassport(null); go('home'); }}
        />
      )}
      {view === 'passport' && !passport && <Home onStart={startBuild} hasPassport={false} />}
      {view === 'method' && <Method />}
    </Shell>
  );
}

function Shell({ view, go, hasPassport, isDemo, children }) {
  const nav = [
    { id: 'home', label: 'Home' },
    { id: 'build', label: hasPassport && !isDemo ? 'Edit passport' : 'Create passport' },
    ...(hasPassport ? [{ id: 'passport', label: isDemo ? 'Demo passport' : 'My passport' }] : []),
    { id: 'method', label: 'How it works' },
  ];
  return (
    <div className="app">
      <a className="skip" href="#main">Skip to content</a>
      <header className="topbar no-print">
        <button className="brand" onClick={() => go('home')} aria-label="AI Skill Passport home">
          <span className="brand-mark" aria-hidden="true">◈</span>
          <span>
            <strong>AI Skill Passport</strong>
            <small>Prove skills with evidence · PLP–ILO</small>
          </span>
        </button>
        <nav aria-label="Main">
          {nav.map((n) => (
            <button key={n.id} className={view === n.id ? 'nav-btn active' : 'nav-btn'} aria-current={view === n.id ? 'page' : undefined} onClick={() => go(n.id)}>
              {n.label}
            </button>
          ))}
        </nav>
      </header>
      <main id="main">{children}</main>
      <footer className="footer no-print">
        <p>
          <strong>Automated evidence check, not a certification.</strong> AI Skill Passport links skills to what can be seen in a public repository.
          It is not an official qualification, an independent assessment or a guarantee of ability. Employers should interview and test as usual.
        </p>
        <p className="muted">PLP–ILO Mini-Hackathon 2026 · Track 1: Credential Recognition &amp; Skills Validation · SDGs 4 &amp; 8 · Your data stays in your browser.</p>
      </footer>
    </div>
  );
}
