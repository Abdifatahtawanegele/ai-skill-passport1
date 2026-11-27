import { SKILLS, CATEGORIES } from '../engine/skills.js';

export default function Method() {
  return (
    <div className="page narrow">
      <h1>How the evidence check works</h1>
      <p className="lead">
        The “AI” in AI Skill Passport is an automated evidence analyser. It's deliberately rule-based and explainable: every result points to something
        real in the repository. It doesn't use a text generator, so it can't invent experience the code doesn't show.
      </p>

      <div className="card method">
        <h2>1. What we read</h2>
        <p>
          From the public GitHub API: repository details, language statistics, the file list and the contributor list. From the raw file host: dependency
          files (<code>package.json</code>, <code>requirements.txt</code>, <code>pyproject.toml</code>, <code>composer.json</code>,{' '}
          <code>pubspec.yaml</code>…) and the README. That's 4 API requests per analysis. <b>No code is downloaded in full, run or stored.</b>
        </p>

        <h2>2. Signals → skills</h2>
        <p>Each skill in the catalog lists the signals that count as evidence:</p>
        <ul>
          <li><b>Language share:</b> e.g. Python is 30% of the code (2% minimum; 25%+ counts double).</li>
          <li><b>Dependencies:</b> e.g. <code>react</code> or <code>pandas</code> declared in a manifest file.</li>
          <li><b>Files and structure:</b> e.g. <code>*.test.js</code>, <code>.github/workflows/</code>, <code>Dockerfile</code>, <code>.ipynb</code>.</li>
          <li><b>Commits:</b> commits attributed to the candidate's GitHub username (Git skill and authorship).</li>
          <li><b>README:</b> length, sections and setup instructions (documentation skill).</li>
        </ul>
        <p>
          <span className="lv strong">Strong evidence</span> needs two or more kinds of signal, or one very strong signal.{' '}
          <span className="lv evidenced">Evidence found</span> means at least one signal.{' '}
          <span className="lv nf">Self-reported</span> means the candidate claims the skill but this project doesn't show it. That doesn't mean they lack it.
        </p>

        <h2>3. The evidence score (0–100)</h2>
        <ul>
          <li>Claimed skills backed by evidence: up to 40</li>
          <li>Authorship (owner or main contributor = 25, minor contributor = 12): up to 25</li>
          <li>Live demo (10), README (10), automated tests (8), CI/deployment config (4), description (3)</li>
        </ul>
        <p>The breakdown is shown on every passport, so nobody has to trust an unexplained number.</p>

        <h2>4. Limits we state openly</h2>
        <ul>
          <li>A repository can't prove who typed the code. Authorship relies on GitHub commit attribution.</li>
          <li>One project shows only part of a person's skills.</li>
          <li>Private repositories can't be analysed.</li>
          <li>Unauthenticated GitHub access allows about 15 analyses per hour per network.</li>
        </ul>

        <h2>5. Privacy</h2>
        <p>
          Your passport is saved only in your browser. A share link carries the passport inside the link itself (after the <code>#</code>), which is
          never sent to a server. Only people you give the link to can open it.
        </p>
      </div>

      <h2 className="catalog-h">Skill catalog ({SKILLS.length} skills)</h2>
      {CATEGORIES.map((c) => (
        <p key={c} className="catalog"><b>{c}:</b> {SKILLS.filter((s) => s.cat === c).map((s) => s.name).join(', ')}</p>
      ))}
    </div>
  );
}
