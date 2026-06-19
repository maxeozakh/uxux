// Lorelei Neutral via DiceBear (CC0).
// `seed` is an opaque id — same seed always yields the same face. Pick/replace via:
// https://www.dicebear.com/playground/?style=lorelei-neutral
export const loreleiFace = (seed, bg) =>
  `https://api.dicebear.com/10.x/lorelei-neutral/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bg.slice(1)}`;

// Agents from the article notes. `avatar`: 'face' (DiceBear seed) or 'atlas'.
// 'atlas' is a hand-inked SVG that mimics the Lorelei Neutral ink style.
// `color` drives accents (highlight glow + apex dot); `bg` is the avatar circle fill.
export const AGENTS = [
  { id: 'eric', name: 'Eric', role: 'inbox & DMs', avatar: 'face', seed: 'ifh4hq75', color: '#C96442', bg: '#f6e9e0', ph: 'triage my DMs for me…' },
  { id: 'mei', name: 'Mei', role: 'growth & analytics', avatar: 'face', seed: 'mh4693b8', color: '#5B83B0', bg: '#e6edf6', ph: 'where\u2019s my next follower coming from?' },
  { id: 'muse', name: 'Muse', role: 'content & captions', avatar: 'face', seed: 'c5ekh2gv', color: '#C0568A', bg: '#f7e6ef', ph: 'write me a caption that pops…' },
  { id: 'ralph', name: 'Ralph', role: 'scheduling & loops', avatar: 'face', seed: 'rzgb1lg2', color: '#5F9A4A', bg: '#e9f2e3', ph: 'queue up this week\u2019s posts…' },
  { id: 'atlas', name: 'Atlas', role: 'audience insights', avatar: 'atlas', color: '#2F6FE0', bg: '#e6eefb', ph: 'what does my audience want?' },
];

// Simple, intentionally-rough placeholder bust (10x10). Recolored per agent.
export const PIXEL_BUST = [
  '...oooo...',
  '..oBBBBo..',
  '..oBBBBo..',
  '..oSSSSo..',
  '..oSEESo..',
  '..oSSSSo..',
  '...oSSo...',
  '..oCCCCo..',
  '.oCCCCCCo.',
  '.oCCCCCCo.',
];

export function bustPalette(color) {
  return { o: '#2a2320', B: color, S: '#f0c9a0', E: '#2a2320', C: color };
}
