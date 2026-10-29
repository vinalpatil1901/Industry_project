# Campus360

Campus360 is a single-page Vite website. It has one shared Campus360 sidebar with two connected areas:

| Area | URL |
| --- | --- |
| Career | `http://localhost:5173/#career-survey` |
| Money Management | `http://localhost:5173/#money-expense` |

## Setup

```bash
npm install
```

## Run the complete website

```bash
npm run dev
```

Open `http://localhost:5173/`. Use the single sidebar to move between Career Survey, College Recommendation, and every Money Management subsection. The URL updates with a hash, but the app remains on the same page and server.

## Production check

```bash
npm run build
npm run preview
```

## Deploy to Vercel

This repository deploys as one public Vite service named `app`. The React
source lives under `Career&college/`, but it is built by the root Vite project,
so it must not be configured as a second Vercel service.

1. Import the GitHub repository into Vercel and keep the project root as `.`.
2. Add these environment variables for both **Production** and **Preview**:

   ```text
   VITE_SUPABASE_URL
   VITE_SUPABASE_PUBLISHABLE_KEY
   ```

3. Do not add `DATABASE_URL` or any database password to Vercel. This is a
   browser-only Vite app and only uses the Supabase publishable key.
4. Deploy. Vercel runs `npm run build` and routes all public paths to the
   `app` service through `vercel.json`.

For a local Vercel routing check, install the Vercel CLI and run:

```bash
vercel dev -L
```
