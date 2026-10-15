# Puerta 18 - Digital Sticker Album (PWA)

## Project Overview
A lightweight, offline-first Progressive Web App designed to gamify the end-of-year youth exhibition for "Puerta 18". Visitors explore physical workshop stations ("Nuestra Ciudad de Talleres Abiertos"), scan QR codes on project tables, unlock digital collectible stickers ("cromos"), view project stories ("La Vuelta de Tuerca"), and redeem a final reward.

## Core Architectural Principles
- **Zero Friction & Privacy-First:** No accounts, no logins, no names, no email collection.
- **Offline & Low-Bandwidth Priority:** The event venue has unreliable mobile connectivity. The app must run entirely client-side using `localStorage` for progress. Static data lives in a local JSON file (`src/data/stands.json`).
- **Asynchronous Telemetry (Fire-and-Forget):** The backend exists solely to collect anonymous visitor metrics (hits per stand, peak hours, drop-off). Front-end user feedback must never wait for backend network calls (`navigator.sendBeacon` or unawaited `fetch`).
- **Defensive Modular UI:** Design tokens and visual styling are subject to iteration. Logic MUST be decoupled from presentation components so themes, fonts, or layouts can pivot easily.

## Tech Stack
- **Frontend:** React 18+ (Vite), TypeScript, Tailwind CSS v3.
- **Storage & State:** Web `localStorage` accessed via custom React hooks (`useAlbum`).
- **Styling & Icons:** Tailwind CSS tokens (`tailwind.config.js`), Lucide React (if icons are needed).
- **Backend (Target):** Vercel Serverless Functions (`/api/telemetry.ts`) + PostgreSQL (Neon/Supabase).

## Development Guidelines for Claude Code

### 1. Code Style & Modularity
- **Separation of Concerns:** Keep business logic inside `src/hooks/` and pure UI inside `src/components/ui/` and `src/components/album/`.
- **No Hardcoded Colors or Fonts:** Always use semantic Tailwind classes configured in the theme (e.g., `bg-brand-dark`, `text-brand-magenta`, `font-display`, `font-body`).
- **Strict TypeScript:** Provide explicit interfaces for all component props and data structures. Avoid `any`.

### 2. File Organization
- `src/types/`: TypeScript definitions (`Stand`, `UnlockResult`, etc.).
- `src/data/stands.json`: Static dictionary of exhibition projects.
- `src/utils/`: Pure helper functions (`storage.ts`, `qr.ts`).
- `src/hooks/`: Business logic hooks (`useAlbum.ts`).
- `src/components/ui/`: Dumb presentation components (Buttons, Badges, Modals, Progress bars).
- `src/components/album/`: Domain-specific components (CromoCard, AlbumGrid, StampBadge).
- `src/views/`: Screen-level layouts (AlbumView, ScannerView, DetailModal, RewardView).
- `api/`: Serverless endpoints for Vercel.

### 3. Workflow & Constraints
- Work incrementally in bounded stages.
- Never refactor or delete previously agreed foundational logic without explicit user instruction.
- Keep bundle size minimal: Avoid heavy third-party dependencies unless strictly necessary (e.g., use small QR libraries like `html5-qrcode`).
- Maintain testing helpers: Always preserve the ability to reset progress (`resetProgress()`) and debug unlocked states during mobile testing.