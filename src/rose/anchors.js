// Option anchors for the automation blend widgets. Wording kept short + gen-z.
export const OPTIONS = {
  engage: { id: 'engage', label: 'engage my ppl', short: 'engage', color: '#C96442', pattern: 'dots' },
  monetize: { id: 'monetize', label: 'get the bag', short: 'the bag', color: '#D9A441', pattern: 'lines' },
  reach: { id: 'reach', label: 'reach new ppl', short: 'reach', color: '#5B83B0', pattern: 'waves' },
  community: { id: 'community', label: 'build my community', short: 'community', color: '#7FA37F', pattern: 'cross' },
  viral: { id: 'viral', label: 'go viral fr', short: 'viral', color: '#C0568A', pattern: 'rings' },
  consistent: { id: 'consistent', label: 'stay consistent', short: 'consistent', color: '#8A6FB0', pattern: 'grid' },
};

export const WHEEL_ANCHORS = [
  OPTIONS.engage,
  OPTIONS.viral,
  OPTIONS.reach,
  OPTIONS.community,
  OPTIONS.monetize,
];

export const TRIANGLE_ANCHORS = [OPTIONS.engage, OPTIONS.reach, OPTIONS.monetize];

export const PETAL_ANCHORS = [
  OPTIONS.engage,
  OPTIONS.viral,
  OPTIONS.reach,
  OPTIONS.community,
  OPTIONS.monetize,
  OPTIONS.consistent,
];

// Inverse-distance softmax style weighting from a point to a set of anchor points.
export function inverseDistanceWeights(point, anchorPoints) {
  const eps = 0.0001;
  const raw = anchorPoints.map((a) => {
    const dx = point.x - a.x;
    const dy = point.y - a.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    return 1 / Math.pow(d + eps, 2.2);
  });
  const sum = raw.reduce((s, v) => s + v, 0) || 1;
  return raw.map((v) => v / sum);
}

// Barycentric coords of p inside triangle (a,b,c), clamped to be non-negative & normalized.
export function barycentric(p, a, b, c) {
  const v0x = b.x - a.x, v0y = b.y - a.y;
  const v1x = c.x - a.x, v1y = c.y - a.y;
  const v2x = p.x - a.x, v2y = p.y - a.y;
  const d00 = v0x * v0x + v0y * v0y;
  const d01 = v0x * v1x + v0y * v1y;
  const d11 = v1x * v1x + v1y * v1y;
  const d20 = v2x * v0x + v2y * v0y;
  const d21 = v2x * v1x + v2y * v1y;
  const denom = d00 * d11 - d01 * d01 || 1;
  let v = (d11 * d20 - d01 * d21) / denom;
  let w = (d00 * d21 - d01 * d20) / denom;
  let u = 1 - v - w;
  u = Math.max(0, u);
  v = Math.max(0, v);
  w = Math.max(0, w);
  const s = u + v + w || 1;
  return [u / s, v / s, w / s];
}

export function clampToCircle(p, cx, cy, r) {
  const dx = p.x - cx;
  const dy = p.y - cy;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d <= r) return p;
  const k = r / d;
  return { x: cx + dx * k, y: cy + dy * k };
}

export function clampToTriangle(p, a, b, c) {
  const [u, v, w] = barycentric(p, a, b, c);
  return {
    x: a.x * u + b.x * v + c.x * w,
    y: a.y * u + b.y * v + c.y * w,
  };
}

// Build a short, playful sentence describing the current mix.
// Explicitly reflects "in-between" picks (two-way & three-way blends).
export function mixSentence(weighted) {
  const sorted = [...weighted].sort((a, b) => b.weight - a.weight);
  const n = sorted.length;
  const baseline = 1 / n;
  const [a, b, c] = sorted;

  // total deviation from a perfectly even split → how "decided" the pick is
  const variance = sorted.reduce((s, x) => s + Math.abs(x.weight - baseline), 0);

  // sitting near the middle → everything at once
  if (variance < (n >= 5 ? 0.24 : 0.16)) return 'a lil bit of everything';

  // one clear winner
  if (a.weight > 0.55 && a.weight - b.weight > 0.22) return `all in on ${a.option.short}`;

  // three-way blend — top three are all in play and close together
  if (c && c.weight > baseline * 1.12 && a.weight - c.weight < 0.13) {
    return `${a.option.short} + ${b.option.short} + ${c.option.short}, chaotic good`;
  }

  // two-way blend
  if (b && b.weight > baseline * 1.18) {
    const gap = a.weight - b.weight;
    if (gap < 0.09) return `right in between ${a.option.short} & ${b.option.short}`;
    if (gap < 0.2) return `${a.option.short} w/ heavy ${b.option.short} energy`;
    return `mostly ${a.option.short}, w/ a lil ${b.option.short}`;
  }

  return `leaning ${a.option.short}`;
}

export function blendColor(weighted) {
  let r = 0, g = 0, b = 0;
  for (const { option, weight } of weighted) {
    const hex = option.color.replace('#', '');
    r += parseInt(hex.slice(0, 2), 16) * weight;
    g += parseInt(hex.slice(2, 4), 16) * weight;
    b += parseInt(hex.slice(4, 6), 16) * weight;
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}
