This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Flask admin API

- Set **`NEXT_PUBLIC_ADMIN_API_URL`** in `.env.local` (see `.env.local.example`) to a URL the **browser** can reach, e.g. `http://localhost:8000` — not a Docker-only hostname unless the browser resolves it.
- If **machine-ui** uses port **3000**, run admin-ui on **3001**: `npx next dev -p 3001` (CORS in `docker-compose` includes `http://localhost:3001`).
- **Still mock** (Next route handlers under `app/api/`): `/api/dashboard`, `/api/notifications`, `/api/alerts`, `/api/sales`. Products, machines, orders, coupons, and customers read from Flask `/api/admin/*`.

## Docker Compose (repo root)

From the project root:

```bash
docker compose up --build
```

On startup, **server**, **agent (Pi)**, **machine-ui**, **admin-ui**, and **swagger-ui** print a short URL block (`Host browser` vs in-container `Local` / `Network`). See the comment table at the top of [`docker-compose.yml`](../../docker-compose.yml) for the canonical port map.

| Service | From your host |
|---------|----------------|
| API + Socket.IO | `http://localhost:8000` |
| machine-ui | `http://localhost:3000` |
| admin-ui | `http://localhost:3001` |
| swagger-ui | `http://localhost:8081` |
| agent (Pi) | `http://localhost:5000` |
| MySQL | `localhost:3307` |

- **admin-ui** maps host **3001** → container **3000**. Build arg `NEXT_PUBLIC_ADMIN_API_URL` defaults to `http://localhost:8000` for the browser.
- **swagger-ui** loads `swagger.yaml` read-only; **Try it out** uses `http://localhost:8000` (CORS includes `http://localhost:8081`). Host port **8081** avoids clashing with Jenkins on **8080**.
- Flasgger: **`http://localhost:8000/apidocs`** (same `swagger.yaml` mount on the server).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
