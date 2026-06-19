// Scripted "generative UI" demo. The brain streams partial predictions to the
// interface, which renders skeletons it then fills in — or *morphs* when a
// prediction turns out wrong. Three scenarios play back to back:
//   A) clarify  — brain guesses a report, realises it needs a target → morph to a question
//   B) success  — brain guesses a report and it resolves, layer by layer
//   C) error    — brain guesses a report, but the automation is unreachable → morph to error
//
// A "panel" step carries a list of frames. Each frame is a snapshot of the
// panel's blocks; the renderer morphs between consecutive frames. Blocks are
// matched across frames by `id`, so a skeleton and the content that replaces it
// share a node and animate (height/colour/opacity) instead of blinking.

export const USER_CHAR_MS = 24;
export const AGENT_ID = 'mei'; // single assistant driving this demo

const skel = (id, kind, extra = {}) => ({ id, kind, state: 'skel', ...extra });
const real = (id, kind, extra = {}) => ({ id, kind, state: 'real', ...extra });

// ── Scenario A — clarify (prediction needs more info) ──────────────────────
const FRAMES_CLARIFY = [
  { hint: 'thinking', blocks: [skel('title', 'title', { w: '54%' })] },
  { hint: 'drafting performance report', blocks: [skel('title', 'title', { w: '54%' }), skel('stats', 'stats')] },
  {
    hint: 'guessing layout',
    hold: 700,
    blocks: [skel('title', 'title', { w: '54%' }), skel('stats', 'stats'), skel('body', 'bars')],
  },
  {
    hint: 'needs: which automation?',
    hold: 1600,
    settled: true,
    blocks: [
      real('title', 'title', { text: 'Which automation do you mean?' }),
      real('chips', 'chips', { items: ['Welcome DM flow', 'Story reply bot', 'Comment → DM'] }),
    ],
  },
];

// ── Scenario B — success (resolves layer by layer) ─────────────────────────
const STATS_OK = [
  { value: '1,204', label: 'DMs sent' },
  { value: '38%', label: 'reply rate' },
  { value: '+212', label: 'new follows' },
];
const TITLE_OK = 'Welcome DM flow';
const FRAMES_SUCCESS = [
  { hint: 'loading Welcome DM flow', blocks: [skel('title', 'title', { w: '46%' })] },
  { hint: 'loading metrics', blocks: [skel('title', 'title', { w: '46%' }), skel('stats', 'stats')] },
  {
    hint: 'rendering chart',
    blocks: [skel('title', 'title', { w: '46%' }), skel('stats', 'stats'), skel('body', 'bars')],
  },
  {
    hint: 'resolving',
    blocks: [real('title', 'title', { text: TITLE_OK }), skel('stats', 'stats'), skel('body', 'bars')],
  },
  {
    hint: 'resolving metrics',
    blocks: [real('title', 'title', { text: TITLE_OK }), real('stats', 'stats', { items: STATS_OK }), skel('body', 'bars')],
  },
  {
    hint: 'done',
    hold: 1900,
    settled: true,
    blocks: [
      real('title', 'title', { text: TITLE_OK }),
      real('stats', 'stats', { items: STATS_OK }),
      real('body', 'bars', {
        bars: [0.4, 0.52, 0.58, 0.95, 0.7, 0.6, 0.46],
        labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      }),
      real('note', 'note', { text: 'Peak replies Thursday around 9pm.' }),
    ],
  },
];

// ── Scenario C — error (prediction was wrong, morph gracefully) ────────────
const FRAMES_ERROR = [
  { hint: 'loading Giveaway report', blocks: [skel('title', 'title', { w: '50%' })] },
  { hint: 'loading metrics', blocks: [skel('title', 'title', { w: '50%' }), skel('stats', 'stats')] },
  {
    hint: 'fetching automation…',
    hold: 800,
    blocks: [skel('title', 'title', { w: '50%' }), skel('stats', 'stats'), skel('body', 'bars')],
  },
  {
    hint: 'unreachable',
    hold: 2200,
    settled: true,
    blocks: [
      real('body', 'error', {
        title: 'Couldn\u2019t load this automation',
        sub: '\u201cGiveaway\u201d was deleted on May 3.',
      }),
    ],
  },
];

// Same prompt, three possible outputs — rendered side by side so the whole
// "one prompt → three outcomes" story can be recorded in a single GIF.
export const PROMPT = 'how\u2019s my automation performing?';

export const SCENARIOS = [
  { id: 'clarify', label: 'clarify', frames: FRAMES_CLARIFY },
  { id: 'error', label: 'error', frames: FRAMES_ERROR, prompt: 'pull up last month\u2019s giveaway stats' },
  { id: 'success', label: 'success', frames: FRAMES_SUCCESS, prompt: 'how\u2019s my dm automation going?' },
];

export const DEFAULT_FRAME_HOLD = 600;
export const THINK_MS = 1100;
