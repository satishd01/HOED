# SyncScribe — Master Implementation Plan
### House of EdTech Fullstack Developer Assignment (v2.1)

> Work through phases in order. Check items off as completed.

---

## Phase 1 — Core Editor Stability ✅

- [x] Fix IndexedDB loading race: 2s timeout fallback added
- [x] Connection status enhanced: amber pulse on sync, green synced, red offline
- [x] Awareness field broadcasts user presence to CollaborationBar
- [x] `history: false` in StarterKit (Yjs conflict fix)
- [x] Removed @tiptap/extension-collaboration-cursor (mislabeled v2 package)

---

## Phase 2 — Documents Dashboard & CRUD ✅

- [x] Documents list page: empty state, cards, last-updated, collaborator avatars
- [x] Create document dialog → redirect to editor
- [x] Delete with confirm dialog
- [x] Share dialog with collaborator list and remove button (in editor page)

---

## Phase 3 — Offline-First Sync Engine ✅

- [x] `useNetworkStatus` hook (navigator.onLine + online/offline events)
- [x] `OfflineBanner` component — amber when offline, green on reconnect
- [x] Added to dashboard layout — visible everywhere
- [x] `ConnectionStatus` — pulsing amber "Syncing..." → green "Synced"
- [x] Yjs CRDT documented in editor.tsx comments

---

## Phase 4 — Version History & Time Travel ✅

- [x] Version history page: timeline with dot, label, creator, relative time
- [x] Preview panel: renders saved HTML or plain text
- [x] Restore: writes to sessionStorage → editor reads on load → applies Yjs snapshot
- [x] Snapshot size guard: 4MB max in POST /versions API

---

## Phase 5 — AI Features (Gemini) ✅

- [x] AI route: /api/ai — streamText with Gemini 2.0 Flash
- [x] AI panel: Summarize, Continue Writing, Improve, Translate, Brainstorm, Custom prompt
- [x] Streaming SSE response parsed in client
- [ ] Add GOOGLE_GENERATIVE_AI_API_KEY to .env.local (manual step)

---

## Phase 6 — Security Hardening ✅

- [x] Rate limiter: sliding-window, self-cleaning, configurable per route
- [x] UUID validation on all route params
- [x] HTML sanitization on document title (PATCH)
- [x] Snapshot size guard pre-decode (4MB) on POST /versions
- [x] Rate limiting applied to: create-doc, patch-doc, create-version
- [x] Security model documented in README

---

## Phase 7 — UI Polish & Accessibility ✅

- [x] Connection status aria-live for screen readers
- [x] OfflineBanner role="alert" aria-live="assertive"
- [x] All editor buttons have aria-label
- [x] All interactive elements have unique IDs

---

## Phase 8 — Testing ✅ (Completed)

- [x] Setup Vitest
- [x] Unit: rate-limiter, sanitize, auth-actions
- [x] Integration: document API routes
- [x] Setup Playwright E2E
- [x] E2E: register → create → type → save snapshot → restore

---

## Phase 9 — Deployment & CI/CD ✅

- [x] GitHub Actions CI: lint → type-check → build on every PR
- [ ] Deploy Hocuspocus to Railway (manual step)
- [ ] Deploy Next.js to Vercel (manual step)
- [ ] Update NEXT_PUBLIC_WS_URL after deploy

---

## Phase 10 — Documentation ✅

- [x] README: architecture diagram, CRDT explanation, security model, API reference
- [x] Setup guide, deployment instructions
- [x] Design decisions documented

---

## Outstanding Manual Steps

1. **Add Gemini API key** to `.env.local`:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your-key-here
   ```

2. **Deploy Hocuspocus** to Railway:
   - Connect repo, set start command: `npx tsx server/index.ts`
   - Env: `DATABASE_URL`, `AUTH_SECRET`, `WS_PORT=1234`

3. **Deploy Next.js** to Vercel:
   - Add all env vars
   - Update `NEXT_PUBLIC_WS_URL` to Railway WS URL

4. **Run tests** (Phase 8 still pending)
