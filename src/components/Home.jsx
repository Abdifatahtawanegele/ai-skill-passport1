import { DEMOS } from '../data/demos.js';

export default function Home({ onStart, hasPassport, onOpen }) {
  // hasPassport is false for demo passports so the main button always creates the user's own.
  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Track 1 · Credential Recognition &amp; Skills Validation</p>
          <h1>
            Your certificates may be lost. <em>Your code is still evidence.</em>
          </h1>
          <p className="lead">
            AI Skill Passport turns one GitHub project into a skills passport you can share. Every skill is linked to the file, dependency or commit that
            proves it. Claims without evidence are labelled as such, and nothing is invented.
          </p>
          <div className="hero-actions">
            <button className="btn primary lg" onClick={() => onStart()}>{hasPassport ? 'Edit my passport →' : 'Create my passport →'}</button>
            {hasPassport ? (
              <button className="btn ghost lg" onClick={onOpen}>View my passport</button>
            ) : (
              <a className="btn ghost lg" href="#demo">See a demo passport</a>
            )}
          </div>
          <ul className="trust">
            <li>Free, with no account</li>
            <li>Reads public repos only, never runs code</li>
            <li>Shared by link: you choose who sees it</li>
          </ul>
        </div>
        <div className="hero-card" aria-hidden="true">
          <div className="mini-passport">
            <div className="mp-band"><span>SKILL PASSPORT</span><span className="mp-score">82</span></div>
            <div className="mp-body">
              <div className="mp-row"><span>React</span><b className="lv strong">Strong evidence</b></div>
              <div className="mp-row"><span>Supabase</span><b className="lv strong">Strong evidence</b></div>
              <div className="mp-row"><span>Automated testing</span><b className="lv evidenced">Evidence found</b></div>
              <div className="mp-row"><span>TypeScript</span><b className="lv nf">Not shown here</b></div>
              <div className="mp-foot">87 commits · owner verified · live demo ✓</div>
            </div>
          </div>
        </div>
      </section>

      <section className="how">
        <h2>From profile to proof in five steps</h2>
        <ol className="how-steps five">
          <li><b>1. Profile</b><span>Role, experience, languages and the kind of work you want.</span></li>
          <li><b>2. Skills</b><span>Pick the skills you claim and rate yourself honestly.</span></li>
          <li><b>3. Project</b><span>One GitHub repo, a live demo, the problem it solves and your role.</span></li>
          <li><b>4. Analyse</b><span>We read languages, dependencies, files and commits to find evidence for each skill.</span></li>
          <li><b>5. Share</b><span>Get a passport link for employers and mentors. Print it or save it as PDF.</span></li>
        </ol>
      </section>

      <section id="demo" className="demo">
        <h2>Demo passports</h2>
        <p className="muted">Fictional candidates with saved repository data, so the demo works offline.</p>
        <div className="demo-grid two">
          {DEMOS.map((d) => (
            <button key={d.key} className="demo-card" onClick={() => onStart(d.key)}>
              <b>{d.passport.profile.name}</b>
              <span>{d.label} · {d.passport.profile.location}</span>
              <span className="muted-sm">{d.passport.project.title}</span>
              <span className="link">Open demo passport →</span>
            </button>
          ))}
        </div>
      </section>

      <section className="why">
        <div>
          <h2>Why evidence, not paperwork</h2>
          <p>
            Many displaced developers and analysts lost their transcripts, or hold degrees that take months to recognise. Employers still need confidence
            that someone can do the job. A public project is evidence that can be checked anywhere. This passport makes it <em>readable in two
            minutes</em> and lets anyone re-check it live.
          </p>
        </div>
        <div className="bench">
          <h3>Built against the hackathon benchmarks</h3>
          <ul>
            <li><b>Verification</b>: skills shown through linked evidence, even without paper records</li>
            <li><b>Readiness</b>: a portable, printable record for onboarding and job applications</li>
            <li><b>Market fit</b>: employer-friendly skills, project and authorship at a glance</li>
            <li><b>SDG impact</b>: SDG 4 (skills recognition) and SDG 8 (decent work)</li>
            <li><b>Scalability</b>: no server or API keys, a skill catalog in one file, and a link to share for every cohort</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
