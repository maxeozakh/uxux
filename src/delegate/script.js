// Scripted delegation conversation. The runner walks these steps on a timer.
//
//  kind: 'user'    → a message from the human (right side)
//  kind: 'typing'  → show the typing indicator for `agent` (no bubble)
//  kind: 'agent'   → a message bubble from `agent`
//  kind: 'handoff' → one agent passes the thread to another; plays the picker dial
//
// `agent` / `from` / `to` are agent ids from src/agents/agents.js.

export const SCRIPT = [
  {
    kind: 'user',
    text: 'my tiktok blew up overnight — tons of unread dms on ig and tiktok. help me ride the wave before it cools off.',
  },

  { kind: 'typing', agent: 'eric' },
  {
    kind: 'agent',
    agent: 'eric',
    text: 'On it 🙌 Counted 380 unread across both — FAQs grouped, easy ones replied, collab leads flagged. But reading *why* you spiked isn\u2019t my lane — let me bring in Mei.',
  },

  { kind: 'handoff', from: 'eric', to: 'mei', note: 'Eric brought in Mei \u00b7 growth & analytics' },

  { kind: 'typing', agent: 'mei' },
  {
    kind: 'agent',
    agent: 'mei',
    text: 'Picking up where Eric left off 👋 Let me pull the numbers on what actually drove this spike…',
  },

  // …and Mei keeps reasoning. The demo ends on her thinking.
  { kind: 'typing', agent: 'mei' },
];

// First agent that appears in the thread — the dock starts here.
export const FIRST_AGENT = 'eric';

// Per-character reveal speeds (ms).
export const CHAR_MS = 15; // agent streaming
export const USER_CHAR_MS = 24; // human typing into the composer

// How long each step lingers before the next one fires (ms). Streaming/typing
// steps wait for the reveal to finish plus a short beat.
export function dwell(step) {
  switch (step.kind) {
    case 'user':
      return step.text.length * USER_CHAR_MS + 550;
    case 'typing':
      return 850;
    case 'agent':
      return Math.min(3400, step.text.length * CHAR_MS + 650);
    case 'handoff':
      return 800;
    default:
      return 800;
  }
}
