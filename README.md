# Frontend — Next.js App Router Template

A clean, minimal **Next.js 16 + TypeScript + Tailwind CSS** starter template.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State (global) | Redux Toolkit |
| HTTP client | Axios |
| Forms | React Hook Form + Zod |

## Project structure

```
app/
  (auth)/
    login/page.tsx       ← Login page
    register/page.tsx    ← Register page
  context/
    AuthContext.tsx      ← Auth state (login / register / logout)
  dashboard/page.tsx     ← Protected dashboard stub
  globals.css            ← Tailwind + CSS variables
  layout.tsx             ← Root layout
  page.tsx               ← Home page

components/
  Button.tsx             ← Base button
  Footer.tsx             ← Footer
  Header.tsx             ← Navigation header
  ProtectedRoute.tsx     ← Auth guard wrapper
  Spinner.tsx            ← Loading indicator

services/
  api.ts                 ← Axios instance + authAPI + userAPI

store/
  store.ts               ← Redux store (add slices here)

types/
  index.ts               ← Shared TypeScript types

middleware.ts            ← Next.js route protection
```

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# → Set NEXT_PUBLIC_API_URL to your backend URL

# 3. Start dev server
npm run dev
```

## Auth flow

- `AuthContext` stores `currentUser` + `token` in `localStorage`.
- `middleware.ts` redirects unauthenticated users away from protected pages server-side.
- `ProtectedRoute` component provides a client-side fallback guard.

## Adding a new page

1. Create `app/your-feature/page.tsx`
2. If protected, wrap with `<ProtectedRoute>`
3. Add nav link to `components/Header.tsx`
4. If it needs API calls, add methods to `services/api.ts`

## Adding a new Redux slice

```ts
// store/exampleSlice.ts
import { createSlice } from "@reduxjs/toolkit";
export const exampleSlice = createSlice({ name: "example", initialState: {}, reducers: {} });
export default exampleSlice.reducer;

// store/store.ts  →  add: example: exampleReducer
```
