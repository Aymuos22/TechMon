# TECHMON: Code Frontier

**Build. Battle. Deploy.**

An original 2D retro RPG inspired by the *feel* of classic handheld monster-collecting games — but with software technologies instead of creatures.

## Play

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

## Controls

| Input | Action |
|-------|--------|
| WASD / Arrows | Move |
| Z / Enter / Space | Interact / Confirm |
| X / Esc | Cancel |
| E / Esc | Pause menu |

On mobile, on-screen D-pad + A/B appear automatically.

## Features

- Tile-based world: **Byteburg**, **Pipeline Route**, **Stackhaven**
- Canvas renderer with camera follow
- Dialogue, shops, healing, quests, gym puzzles
- Turn-based battles with type chart, status effects, XP & leveling
- **Tech Scanner** challenges to register technologies
- Party / storage, TechDex, inventory, save/load (LocalStorage + optional cloud sync)

## Stack

React · TypeScript · Vite · Vercel Functions · Postgres · HTML5 Canvas · CSS

## Cloud Saves on Vercel

The app keeps LocalStorage saves as a fallback. When the following Vercel environment variables are set, the title screen enables Google OAuth and cloud save sync:

```bash
DATABASE_URL="postgres://user:password@host/database?sslmode=require"
AUTH_SECRET="generate-at-least-32-random-characters"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
APP_URL="https://your-vercel-app.vercel.app"
```

Create a Google OAuth web client with callback URL:

```text
https://your-vercel-app.vercel.app/api/auth/google/callback
```

For local API testing, use a Vercel-style dev server and set `APP_URL` to that local URL.
