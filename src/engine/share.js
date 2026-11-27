// Shareable passports without a server: the passport is encoded into the URL fragment (#/p/...).
// The fragment is never sent to the hosting server, so the data goes only to whoever gets the link.

function toBase64Url(bytes) {
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

// Keep only what a reader needs; trims evidence lists so links stay a reasonable length.
export function toShareable(passport) {
  const a = passport.analysis;
  return {
    v: 1,
    profile: passport.profile,
    skills: passport.skills,
    project: passport.project,
    summary: passport.summary,
    createdAt: passport.updatedAt || passport.createdAt,
    analysis: a && {
      ...a,
      skills: a.skills.map((s) => ({ ...s, evidence: s.evidence.slice(0, 3) })),
    },
  };
}

export function encodePassport(passport) {
  const json = JSON.stringify(toShareable(passport));
  return toBase64Url(new TextEncoder().encode(json));
}

export function decodePassport(code) {
  const json = new TextDecoder().decode(fromBase64Url(code));
  const data = JSON.parse(json);
  if (data.v !== 1 || !data.profile) throw new Error('Unsupported passport link');
  return data;
}

export function shareUrl(passport) {
  const base = window.location.href.split('#')[0];
  return `${base}#/p/${encodePassport(passport)}`;
}
