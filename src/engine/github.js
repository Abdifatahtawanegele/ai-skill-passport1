// Reads PUBLIC repository data from GitHub in the browser. No token, no backend, no code execution:
// only metadata, the file list and a few text files (manifests + README) are downloaded.
// Unauthenticated limit: 60 API requests/hour per IP. One analysis uses 4.

const API = 'https://api.github.com';
const RAW = 'https://raw.githubusercontent.com';
const MANIFESTS = ['package.json', 'requirements.txt', 'pyproject.toml', 'composer.json', 'pubspec.yaml', 'pom.xml', 'build.gradle'];

export function parseRepoUrl(input = '') {
  const s = input.trim().replace(/[?#].*$/, '').replace(/\/+$/, '').replace(/\.git$/, '');
  const m = s.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)/i) || s.match(/^([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)$/);
  return m ? { owner: m[1], repo: m[2] } : null;
}

export class GitHubError extends Error {
  constructor(message, kind) {
    super(message);
    this.kind = kind;
  }
}

async function getJson(path) {
  const res = await fetch(`${API}${path}`, { headers: { Accept: 'application/vnd.github+json' } });
  if (res.status === 404) throw new GitHubError('Repository not found. Check the URL and make sure the repository is public.', 'not_found');
  if (res.status === 403 || res.status === 429) {
    const reset = Number(res.headers.get('x-ratelimit-reset'));
    const when = reset ? `after ${new Date(reset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'within the hour';
    throw new GitHubError(`GitHub's hourly limit for this network was reached. Try again ${when}, or continue with a self-reported passport.`, 'rate_limit');
  }
  if (!res.ok) throw new GitHubError(`GitHub responded with an error (${res.status}).`, 'http');
  return res.json();
}

async function getRaw(owner, repo, branch, path) {
  try {
    const res = await fetch(`${RAW}/${owner}/${repo}/${branch}/${path}`);
    if (!res.ok) return null;
    const text = await res.text();
    return text.slice(0, 60000); // cap size
  } catch {
    return null;
  }
}

export async function fetchSnapshot(repoUrl, { onStep = () => {} } = {}) {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) throw new GitHubError('That does not look like a GitHub repository URL (expected github.com/owner/repo).', 'bad_url');
  const { owner, repo } = parsed;
  try {
    onStep('Reading repository details');
    const meta = await getJson(`/repos/${owner}/${repo}`);
    if (meta.private) throw new GitHubError('This repository is private. Make it public or pick another project.', 'private');
    const branch = meta.default_branch;

    onStep('Measuring languages');
    const languages = await getJson(`/repos/${owner}/${repo}/languages`);

    onStep('Listing files');
    const tree = await getJson(`/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`);
    const files = (tree.tree || []).filter((t) => t.type === 'blob').map((t) => t.path).filter((p) => !/(^|\/)(node_modules|vendor|dist|build|\.venv|venv)\//.test(p));

    onStep('Checking contributors');
    let contributors = [];
    try {
      contributors = (await getJson(`/repos/${owner}/${repo}/contributors?per_page=100`)) || [];
    } catch (e) {
      if (e.kind === 'rate_limit') throw e;
    }

    onStep('Reading manifests and README');
    const manifestPaths = files.filter((f) => MANIFESTS.includes(f.split('/').pop()) && f.split('/').length <= 3).slice(0, 6);
    const manifests = {};
    await Promise.all(manifestPaths.map(async (p) => { manifests[p] = await getRaw(owner, repo, branch, p); }));
    const readmePath = files.find((f) => /^readme(\.md|\.rst|\.txt)?$/i.test(f));
    const readme = readmePath ? (await getRaw(owner, repo, branch, readmePath)) || '' : '';

    return {
      meta: {
        full_name: meta.full_name,
        html_url: meta.html_url,
        description: meta.description,
        default_branch: branch,
        owner: meta.owner?.login,
        fork: meta.fork,
        homepage: meta.homepage,
        license: meta.license?.spdx_id || null,
        stargazers_count: meta.stargazers_count,
        created_at: meta.created_at,
        pushed_at: meta.pushed_at,
      },
      languages,
      files,
      truncated: !!tree.truncated,
      contributors: (Array.isArray(contributors) ? contributors : []).map((c) => ({ login: c.login, contributions: c.contributions })),
      manifests,
      readme,
      fetchedAt: new Date().toISOString(),
    };
  } catch (e) {
    if (e instanceof GitHubError) throw e;
    throw new GitHubError('Could not reach GitHub. Check your internet connection and try again.', 'network');
  }
}
