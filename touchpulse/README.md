# TouchPulse — Marketing Website

Navigation intelligence platform for people with sight loss. Built with Next.js 14, Tailwind CSS, Framer Motion, and TypeScript.

---

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## Environment Variables

Create a `.env.local` file in the project root:

| Variable | Description |
|---|---|
| `N8N_WEBHOOK_URL` | Full URL of your n8n webhook for contact form submissions |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site (e.g. `https://touchpulse.nl`) |

---

## Deploy to Railway

### 1. Connect GitHub repo
1. Go to railway.app and create a new project.
2. Choose **Deploy from GitHub repo** and select this repository.
3. Railway detects the `Dockerfile` automatically via `railway.json`.

### 2. Set environment variables
In your Railway project → **Variables**, add:
- `N8N_WEBHOOK_URL`
- `NEXT_PUBLIC_SITE_URL` = `https://touchpulse.nl`

### 3. Deploy
Click **Deploy**. Railway builds the Docker image and starts the server on port 3000.

---

## Connect custom domain (touchpulse.nl)

1. Railway project → **Settings → Domains → Add custom domain**.
2. Enter `touchpulse.nl` (and `www.touchpulse.nl` if needed).
3. Add the CNAME record Railway provides in your DNS provider.
4. For apex domain use CNAME flattening or ALIAS record at your DNS provider.
5. SSL is provisioned automatically.

---

## Tech Stack

- **Next.js 14** — App Router, server components, standalone Docker output
- **Tailwind CSS** — utility-first styling with brand CSS variables
- **Framer Motion** — scroll-triggered animations, prefers-reduced-motion aware
- **TypeScript** — end-to-end type safety
- **Google Fonts** — Inter, Lora, JetBrains Mono via next/font
- **n8n** — contact form webhook via /api/contact
