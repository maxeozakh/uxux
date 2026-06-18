// Lorelei Neutral via DiceBear (CC0).
// `seed` is an opaque id — same seed always yields the same face. Pick/replace via:
// https://www.dicebear.com/playground/?style=lorelei-neutral
export const loreleiFace = (seed, bg) =>
  `https://api.dicebear.com/10.x/lorelei-neutral/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bg.slice(1)}`;

// Agents from the article notes. `avatar`: 'face' (DiceBear seed) or 'atlas'.
// 'atlas' is a hand-inked SVG that mimics the Lorelei Neutral ink style.
// `color` drives accents (highlight glow + apex dot); `bg` is the avatar circle fill.
export const AGENTS = [
  { id: 'eric', name: 'Eric', role: 'morning recap', avatar: 'face', seed: 'ifh4hq75', color: '#C96442', bg: '#f6e9e0', ph: 'gimme the lazy morning rundown…' },
  { id: 'mei', name: 'Mei', role: 'growth & research', avatar: 'face', seed: 'mh4693b8', color: '#5B83B0', bg: '#e6edf6', ph: 'where should I grow next?' },
  { id: 'muse', name: 'Muse', role: 'creative, dreamy', avatar: 'face', seed: 'c5ekh2gv', color: '#C0568A', bg: '#f7e6ef', ph: 'dream up something wild…' },
  { id: 'ralph', name: 'Ralph', role: 'loops & chores', avatar: 'face', seed: 'rzgb1lg2', color: '#5F9A4A', bg: '#e9f2e3', ph: 'queue up a chore to loop…' },
  { id: 'atlas', name: 'Atlas', role: 'knowledge', avatar: 'atlas', color: '#2F6FE0', bg: '#e6eefb', ph: 'ask me anything you forgot…' },
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
