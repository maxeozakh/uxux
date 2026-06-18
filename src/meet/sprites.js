// ── Side-profile villager (16x24), facing RIGHT. Flip for left-facing. ──
// . transparent · o outline · K skin · E eye · H hair/hood · S shirt
// P pants · F feet · A accent (scarf) · hand reaches forward (greeting)
export const VILLAGER = [
  '......HHHH......',
  '.....HHHHHH.....',
  '....HHHHHHHH....',
  '....HHHKKKKKo...',
  '....HHKKKKKKo...',
  '....HHKEKKKKo...',
  '....HHKKKKKKKo..',
  '....HHKKKKKKo...',
  '.....HKKKKKo....',
  '......KKKK......',
  '.....AAAAAA.....',
  '....SSSSSSSS....',
  '...SSSSSSSSS....',
  '...SSSSSSSSSK...',
  '...SSSSSSSSS....',
  '....SSSSSSSS....',
  '....SSSSSSSS....',
  '....PPPPPPPP....',
  '....PPPPPPPP....',
  '....PPPPPPPP....',
  '....PPP..PPP....',
  '....PPP..PPP....',
  '...FFFF.FFFFF...',
  '....oo....oo....',
];

export const AGENT_A_PALETTE = {
  o: '#3a2b22',
  K: '#f0c9a0',
  E: '#2a2320',
  H: '#c96442',
  S: '#e0a458',
  P: '#6b4632',
  F: '#3a2b22',
  A: '#9c4a2f',
};

export const BOB_PALETTE = {
  o: '#2a2320',
  K: '#e8c49a',
  E: '#2a2320',
  H: '#4a6fa5',
  S: '#7fa37f',
  P: '#43463a',
  F: '#2a2320',
  A: '#3f6b54',
};

// ── Heart emote (7x6) ──
export const HEART = [
  '.oo.oo.',
  'orrorro',
  'orrrrro',
  '.orrro.',
  '..oro..',
  '...o...',
];
export const HEART_PALETTE = { o: '#7a3b53', r: '#e87aa5' };

// ── Cloud (11x5) ──
export const CLOUD = [
  '...ooo.....',
  '.oowwwoo...',
  'oowwwwwwoo.',
  'owwwwwwwwwo',
  '.ooooooooo.',
];
export const CLOUD_PALETTE = { o: '#d4e4f0', w: '#ffffff' };

// ── Flower (5x6), petal color injected per instance ──
export const FLOWER = [
  '.o.o.',
  'opopo',
  '.oyo.',
  '..g..',
  '..g..',
  '.ggg.',
];
export function flowerPalette(petal) {
  return { o: '#5a7a3a', p: petal, y: '#f3c969', g: '#5f8a4a' };
}

// ── Bush (14x7) ──
export const BUSH = [
  '...ooooo......',
  '..ogggggoo....',
  '.oggGgggggo...',
  'oggggGgggggo..',
  'oggggggGgggo..',
  '.oggggggggo...',
  '..oooooooo....',
];
export const BUSH_PALETTE = { o: '#3f6b3a', g: '#5f9a4a', G: '#7ab85e' };

// ── Tree (16x20) ──
export const TREE = [
  '......oooo......',
  '....ooggggoo....',
  '...ogggGggggo...',
  '..oggggGgggggo..',
  '.oggggGggGggggo.',
  '.ogggggggGggggo.',
  '.ogGggggggggggo.',
  '..oggggGgggggo..',
  '...oggggggggo...',
  '....oooooooo....',
  '.......ott......',
  '.......ott......',
  '.......ott......',
  '.......ott......',
  '......ottto.....',
  '.....ottttto....',
  '....oo....oo....',
  '................',
  '................',
  '................',
];
export const TREE_PALETTE = { o: '#3a2b22', g: '#5f9a4a', G: '#7ab85e', t: '#7a5235' };
