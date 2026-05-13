"# RIGS.AI — PC Buying Advisor

## Problem Statement

Create the PC buying advisor AI chatbot (full AI/ML code) — website + AI chatbot.

## User Choices

- AI models: Claude Sonnet 4.5, GPT-5.2, Gemini 3 Flash (via Emergent Universal LLM Key)
- Features: Conversational chatbot + Curated catalog + Side-by-side comparison
- Build sources: Pre-seeded curated builds + AI-generated on demand
- Auth: Simple JWT email/password to save chat history & favorites
- Style: Tech/Gamer dark theme with neon cyan/magenta/green accents

## Architecture

- **Backend** (`/app/backend/server.py`): FastAPI + MongoDB + emergentintegrations LlmChat. JWT Bearer auth, bcrypt password hashing.
- **Frontend** (`/app/frontend/src/`): React 19 + React Router 7 + Tailwind + shadcn/ui + sonner. AuthContext stores JWT in `localStorage`.
- **Database**: MongoDB collections: `users`, `chat_sessions`, `chat_messages`, `builds`.

## Implemented (Feb 12, 2026)

- Auth: register/login/me with JWT
- Chat: multi-model picker (Claude/GPT/Gemini), session history, anonymous + logged-in
- Catalog: 12 curated 2026 PC builds (Gaming/Workstation/Content Creation/Office/Budget), category & price filters
- Build detail page with specs, pros/cons, performance bars
- Side-by-side compare with diff highlights (green/red)
- AI Custom Build generator (JSON-structured Build via LLM)
- Favorites + chat history persisted per user (Profile page)
- Dark neon theme (Outfit + IBM Plex Sans + JetBrains Mono fonts)
- 17/17 backend tests passing + frontend e2e validated

## Core Personas

- **Buyer**: knows budget, unsure of parts → uses chatbot/recommend
- **Researcher**: browses catalog with filters, compares two builds
- **Returning user**: saves favorites, references chat history

## Backlog (P1)

- Streaming chat responses
- Export build to text / share link
- More categories (HTPC, NAS, ITX-only)
- Price tracking with affiliate links

## Backlog (P2)

- Verify session ownership on `GET /chat/sessions/{id}/messages`
- Build wishlist with stripe checkout simulation
- Multi-language support
  "
