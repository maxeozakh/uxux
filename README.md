# UX Demos

Interaction demos for pitch recordings and design reviews.

## Live demo

**https://maxeozakh.github.io/uxux/**

## Quick start (local)

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Demos

| Route | Demo |
|-------|------|
| `#rose` | Automations (petal rose blend wheel) |
| `#agents` | Agent marking menu |
| `#delegate` | Agent delegation chat — social inbox hand-off demo (auto-playing) |
| `#genui` | Generative UI — three scenarios side by side (for recording) |
| `#try` | Generative UI — interactive scenario picker (mobile-friendly, shareable) |

Use the hamburger menu (top-left) to switch between demos.

## Build

```bash
npm run build
npm run preview
```

For a local preview that matches GitHub Pages paths:

```bash
VITE_BASE_PATH=/uxux/ npm run build
VITE_BASE_PATH=/uxux/ npm run preview
```

## GitHub Pages setup

This repo includes a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that builds and deploys on every push to `main`.

1. Go to **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**

After the first successful workflow run, the live URL appears on the **Pages** settings tab.
