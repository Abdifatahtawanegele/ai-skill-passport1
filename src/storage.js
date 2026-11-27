// The candidate's passport is stored only in this browser. Nothing is uploaded.
const KEY = 'ai-skill-passport:v1';

export function loadPassport() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePassport(p) {
  try {
    if (p) window.localStorage.setItem(KEY, JSON.stringify(p));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: keep working in memory */
  }
}

export function downloadFile(filename, text, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function emptyPassport() {
  return {
    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
    profile: { name: '', headline: '', location: '', github: '', years: '', languages: '', goals: [], contact: '', bio: '' },
    skills: [],
    project: { title: '', repoUrl: '', demoUrl: '', problem: '', contribution: '', team: 'Solo' },
    analysis: null,
    summary: '',
    demoKey: null,
  };
}
