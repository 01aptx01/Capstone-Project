# Smart Vending Machine – Web UI

> **Purpose**: This folder contains the full front‑end implementation of the **Smart Vending Machine** capstone project. It is a Next.js 16 application that provides the user‑facing experience for browsing menus, viewing coupons, redeeming points, and managing a user profile.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [Core Configuration & Scripts](#core-configuration--scripts)
4. [Next.js Application (`app/`)](#nextjs-application-app)
5. [Reusable UI Components (`components/`)](#reusable-ui-components-components)
6. [Domain Logic (`lib/`)](#domain-logic-lib)
7. [Context & State Management (`context/` & `store/`)](#context--state-management)
8. [Static Assets (`public/`)](#static-assets-public)
9. [Build & Deployment](#build--deployment)
10. [Development Workflow](#development-workflow)
11. [Glossary & Terminology](#glossary--terminology)

---

## Project Overview
The **Smart Vending Machine** project consists of three main parts:
- **Server** (`server/` – Flask API)
- **Web UI** – this repository (`web/web-ui/`)
- **Hardware / IoT** – not covered here.

The Web UI consumes the REST API exposed by the server to:
- Display a dynamic menu of products.
- Show a list of user‑specific coupons with status (active/used/expired).
- Allow users to redeem points for new coupons.
- Provide profile and purchase‑history pages.

All pages are built with **Next.js App Router** (v16) and **TypeScript**, employing a clean component‑driven architecture.

---

## Folder Structure
```
web-ui/
├─ .dockerignore               # Files ignored by the Docker build context
├─ .env.local                  # Local environment variables (dev only)
├─ .env.local.example          # Template for .env.local
├─ .gitignore                  # Git ignore rules
├─ .next/                      # Next.js build artefacts (generated)
├─ AGENTS.md                   # Documentation for Gemini‑based agents (optional)
├─ Dockerfile                  # Container definition for production image
├─ README.md                   # **THIS** file – detailed documentation
├─ app/                        # App Router – page, layout, and route groups
│   ├─ (auth)/                # Auth‑related routes (sign‑in, sign‑up)
│   ├─ (main)/                # Primary user‑facing routes (home, coupons, …)
│   ├─ favicon.ico            # Site favicon
│   ├─ globals.css            # Global Tailwind + CSS reset
│   ├─ layout.tsx             # Root layout (providers, theme, etc.)
│   └─ page.tsx               # Root landing page (redirects to /home)
├─ build/                      # Optional custom build scripts / assets
├─ components/                 # Reusable UI building blocks
│   ├─ Ui/                    # Primitive UI components (Button, Chip, EmptyState…)
│   ├─ cards/                 # Card‑style components (MyCouponCard, ProductCard…)
│   ├─ icons/                 # SVG icon collection
│   └─ layout/                # Layout helpers (Header, Sidebar…) 
├─ context/                    # React context providers (UserContext, Theme…)
├─ docker-entrypoint.sh        # Entry script for the Docker container
├─ eslint.config.mjs           # ESLint configuration (Next.js & TypeScript)
├─ lib/                        # Domain‑specific utilities and API wrappers
│   ├─ api/                   # Functions that call the Flask backend (orders, payments…)
│   ├─ auth/                  # Auth helper (token storage, refresh logic)
│   ├─ config.ts              # Centralised config (API base URL, env flags)
│   ├─ constants.ts           # Shared constant values (status enums, colors)
│   ├─ navigation.ts          # Navigation helper (menu items, route titles)
│   ├─ payment/               # Payment gateway adapters (placeholder)
│   └─ utils.ts               # Small utility functions used across the UI
├─ middleware.ts               # Next.js middleware (currently only a deprecation warning)
├─ next-env.d.ts               # Types for Next.js environment variables
├─ next.config.ts              # Next.js configuration (webpack, images, etc.)
├─ node_modules/               # NPM dependencies (auto‑generated)
├─ package.json                # Project metadata, scripts, dependencies
├─ package-lock.json           # Exact versions of all NPM packages
├─ pages/                      # Legacy pages folder (mostly unused – kept for compatibility)
├─ postcss.config.mjs          # PostCSS configuration (Tailwind)
├─ public/                     # Static assets served at / (images, fonts, …)
├─ src/                        # Optional source folder for complex logic (currently empty)
├─ store/                      # State‑management store (e.g., Zustand, Redux – scaffolded)
├─ tailwind.config.ts          # Tailwind CSS configuration (theme, plugins)
├─ tsconfig.json               # TypeScript compiler options
├─ tsconfig.tsbuildinfo         # Incremental compilation cache (auto‑generated)
└─ types/                      # Global TypeScript type declarations
```

---

## Core Configuration & Scripts
| File | Purpose |
|------|---------|
| **Dockerfile** | Builds a minimal `node:alpine` image that runs `next start` in production. |
| **docker-entrypoint.sh** | Entrypoint for the Docker container – installs dependencies, builds the app, then starts the server. |
| **next.config.ts** | Enables webpack 5, sets image domains (e.g., the vending‑machine‑photos bucket), and configures experimental `appDir`. |
| **tailwind.config.ts** | Custom colour palette, dark‑mode (`media`), and extends the default spacing to match the design system. |
| **eslint.config.mjs** | Enforces the **Airbnb** + **Next.js** style guide, integrates Prettier, and adds a rule to disallow `console.log` in production. |
| **.env.local** (git‑ignored) | Stores runtime secrets such as `NEXT_PUBLIC_API_URL`. The project ships a template (`.env.local.example`). |
| **package.json** | Scripts:
- `dev` – `next dev` (development server)
- `build` – `next build`
- `start` – `next start` (production)
- `lint` – `next lint`
- `type-check` – `tsc --noEmit`

---

## Next.js Application (`app/`)
### `(main)` Route Group
- **`page.tsx`** – Root page that redirects to `/home`.
- **`layout.tsx`** – Wraps all pages with providers (`UserProvider`, `ThemeProvider`) and the global CSS.
- **`(auth)`** – Contains authentication pages (`/sign‑in`, `/sign‑up`). Uses the `AuthProvider` from `context/`.
- **Sub‑pages** (inside `(main)`):
  - **`home/page.tsx`** – Dashboard showing quick stats and a shortcut to points redemption.
  - **`coupons/page.tsx`** – Displays user coupons, filter tabs, and a “แลกแต้มรับคูปอง” button.
  - **`redeem/page.tsx`** – Form for entering a coupon code manually (QR code removed per user request).
  - **`profile/page.tsx`** – Shows user details and allows editing of contact information.
  - **`history/page.tsx`** – Purchase history list, paginated.
  - **`help/page.tsx`** – FAQ and contact information.

All pages are **server‑side rendered (SSR)** where appropriate to pre‑fetch data via the API wrappers in `lib/api/`.

---

## Reusable UI Components (`components/`)
| Directory | Key Components | Description |
|-----------|----------------|-------------|
| **Ui** | `Button`, `Chip`, `EmptyState`, `PageHeader`, `Skeleton` | Primitive building blocks, styled with Tailwind and a custom design system (gradient backgrounds, glass‑morphism). |
| **cards** | `MyCouponCard`, `ProductCard`, `HistoryItemCard` | Card UI for each domain entity, handling status badges, masked codes, and hover micro‑animations. |
| **icons** | SVG icons (`MenuIcon`, `CloseIcon`, `CopyIcon`, …) | Used throughout the navigation and action buttons. |
| **layout** | `Header`, `Sidebar`, `Footer` | Layout components that assemble the overall page chrome. |

All components follow the **design token** conventions defined in `tailwind.config.ts` (e.g., `bg-brand`, `text-primary`). They include subtle hover transitions and respect dark‑mode automatically.

---

## Domain Logic (`lib/`)
- **`api/`** – Wrapper functions that call the Flask backend (`/api/orders`, `/api/auth`, `/api/payments`). They return typed data shapes (`UserCoupon`, `Order`, `Product`).
- **`auth/`** – Handles token storage in `localStorage`, automatic token refresh, and exposes a `useAuth` hook.
- **`config.ts`** – Centralised constants like `API_BASE_URL`, `ENABLE_MOCKS`.
- **`constants.ts`** – Enums for coupon status (`active`, `used`, `expired`) and colour mappings used by `MyCouponCard`.
- **`navigation.ts`** – Array of navigation items (label, icon, route) consumed by the sidebar component.
- **`payment/`** – Stub for future payment gateway integration (currently unused).
- **`utils.ts`** – Misc helpers (date formatting, query‑string builder, deep clone).

These files keep the UI **framework‑agnostic** – they can be imported by any React component without pulling in UI‑specific code.

---

## Context & State Management (`context/` & `store/`)
- **`UserContext`** (`context/UserContext.tsx`) – Provides current user phone number, login state, and a method to trigger a reload of coupons.
- **`ThemeContext`** – Toggles light/dark mode and stores the preference in `localStorage`.
- **`store/`** – Scaffolded for a global store (e.g., Zustand). Currently holds a minimal cart slice used by the order page.

---

## Static Assets (`public/`)
All static files are served directly from this folder:
- **`/product/img/…`** – Product images used in the catalogue.
- **`/favicon.ico`** – Browser tab icon.
- **`/fonts/…`** – Custom web fonts (if any).
- **`/icons/…`** – Fallback PNG versions of SVG icons for older browsers.

---

## Build & Deployment
1. **Local Development**
   ```bash
   npm install               # install deps
   npm run dev               # start dev server at http://localhost:3000
   ```
2. **Production Build**
   ```bash
   npm run build             # creates .next/ production assets
   npm start                 # runs the built app
   ```
3. **Docker**
   ```bash
   docker build -t smart-vending-web .
   docker run -p 3000:3000 smart-vending-web
   ```
   The Dockerfile copies the source, installs only `production` dependencies, builds the app, and finally runs `next start`.
4. **CI/CD** – The repository is configured with a GitHub Actions workflow (not shown here) that runs `npm ci`, `npm run lint`, `npm run type-check`, and `npm run build` on every push to `main`.

---

## Development Workflow
- **Feature Branches** – Create a branch `feature/<name>` and push to origin. Open a Pull Request when ready.
- **Testing** – UI components are covered by React Testing Library tests located under `__tests__/` (generated by the scaffold). Run `npm test` to execute them.
- **Linting & Formatting** – Pre‑commit hook (via `husky`) runs `eslint` and `prettier`. Manual run: `npm run lint`.
- **Hot‑Reload** – Next.js automatically refreshes the browser on file changes; any TypeScript errors appear in the terminal.

---

## Glossary & Terminology
- **Coupon** – A discount code associated with a specific vending‑machine location. Has `status` (active/used/expired) and an optional expiry date.
- **Redeem** – The action of entering a coupon code on the `/redeem` page to claim the discount.
- **Points** – Loyalty points earned by purchases; displayed on the `/home` dashboard and redeemable for new coupons.
- **Chip** – UI element used as a filter tab (All, Active, Used, Expired).
- **EmptyState** – A full‑width component that shows a friendly message when a list is empty.

---

*This README is generated automatically to give new contributors a clear map of the `web/web-ui` folder. For deeper dive into each component, refer to the JSDoc comments inside the source files.*
