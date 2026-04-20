# Railway Deploy Prompt — cms.touchpulse.ai

Use this prompt with Railway's AI agent or as a step-by-step guide for manual setup.

---

## Prompt for Railway Agent

> Deploy the `cms/` directory in the `liamgeschwindt1/website` GitHub repository as a new Railway service called **touchpulse-cms**. It is a Next.js 14 app with Prisma + PostgreSQL. Follow these steps exactly:
>
> 1. **Create a new Railway project** (or add a service to the existing `touchpulse` project).
> 2. **Add a PostgreSQL database** addon to the project. Railway will auto-inject `DATABASE_URL`.
> 3. **Create a new service** from the GitHub repo `liamgeschwindt1/website`.
>    - Set **Root Directory** to `cms`
>    - The service will use `cms/Dockerfile` and `cms/railway.json` automatically.
> 4. **Set the following environment variables** on the service:
>
>    | Variable | Value |
>    |---|---|
>    | `SESSION_SECRET` | Generate a random string ≥ 32 characters |
>    | `CMS_PASSWORD` | Choose a strong admin password |
>    | `CMS_API_KEY` | Generate a random string (used by touchpulse.nl to fetch posts) |
>    | `NEXT_PUBLIC_CMS_URL` | `https://cms.touchpulse.ai` |
>
>    `DATABASE_URL` is injected automatically by the PostgreSQL addon — do **not** set it manually.
>
> 5. **Run the database migration** after the first successful deploy:
>    - Open the service shell in Railway (`railway run`) or use the Railway CLI:
>      ```
>      railway run npx prisma db push
>      ```
>    - This creates the `Post` table in PostgreSQL.
>
> 6. **Add a custom domain**:
>    - In Railway → service → Settings → Domains → Add custom domain
>    - Enter: `cms.touchpulse.ai`
>    - Railway will show a CNAME value — add it to your DNS provider (e.g. Cloudflare) as:
>      ```
>      CNAME  cms  →  <railway-provided-cname>.railway.app
>      ```
>
> 7. **Verify the deploy**:
>    - Visit `https://cms.touchpulse.ai` — it should redirect to `/admin/login`
>    - Log in with the `CMS_PASSWORD` you set
>    - Create a test post and confirm it appears at `https://cms.touchpulse.ai/api/posts`
>
> 8. **Connect to the main touchpulse.nl site** (optional — for blog integration):
>    - Add these env vars to the **touchpulse** service (you can find these in Railway):
>      ```
>      CMS_API_URL=https://cms.touchpulse.ai
>      CMS_API_KEY=<same key you set on the CMS service>
>      ```
>    - Then fetch posts server-side in touchpulse with:
>      ```ts
>      const res = await fetch(`${process.env.CMS_API_URL}/api/posts`, {
>        headers: { 'x-api-key': process.env.CMS_API_KEY! },
>        next: { revalidate: 60 }, // ISR — refresh every 60s
>      })
>      const { posts } = await res.json()
>      ```

---

## Architecture Overview

```
cms.touchpulse.ai  (this service)
  └── Next.js 14 App Router
  └── Prisma ORM → PostgreSQL (Railway addon)
  └── iron-session cookie auth
  └── /admin/*        Admin dashboard (password protected)
  └── /api/posts      Public GET (published posts only)
  └── /api/posts?all=true  All posts (requires x-api-key header)
  └── /api/posts/:id  Single post by id or slug

touchpulse.nl  (existing service)
  └── Fetches /api/posts from CMS with x-api-key for blog page
```

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Auto-injected by Railway PostgreSQL addon | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | ≥ 32-char random string for iron-session encryption |
| `CMS_PASSWORD` | ✅ | Admin login password |
| `CMS_API_KEY` | ✅ | Server-to-server API key for touchpulse.nl → CMS requests |
| `NEXT_PUBLIC_CMS_URL` | ✅ | `https://cms.touchpulse.ai` |
