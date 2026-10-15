# PaperPilot

PaperPilot is a research paper workspace built with React, Vite, JavaScript, Tailwind CSS, React Router, and Recharts. It searches the OpenAlex catalog and uses Supabase Auth and Postgres to store account data and private research libraries.

## Connect Supabase

1. Create a project at [Supabase](https://supabase.com/dashboard).
2. In **Project Settings → API**, copy the Project URL and the publishable key.
3. Copy `.env.example` to `.env.local`, then replace its example values with those credentials. The publishable key is designed for browser use; never put a Supabase secret or service-role key in a `VITE_` variable.
4. In your Supabase project, open **SQL Editor**, paste and run `supabase/schema.sql`. This creates the saved-paper and collection tables and policies that limit each account to its own rows. If you already ran an older version of this script, run the updated file again to add collections safely.
5. In **Authentication → URL Configuration**, add your local URL (usually `http://localhost:5173`) to the allowed redirect URLs. Add your deployed Vercel URL there after deployment.
6. Run `npm install` and `npm run dev`.

Sign-up and login use Supabase Auth. If email confirmation is enabled in the Supabase project, new users need to click the confirmation link before signing in. Configure SMTP in Supabase for reliable production email delivery. Password reset links are supported.

## Run and verify

- `npm run dev` starts the local app.
- `npm test` runs the OpenAlex, author-filter, and citation-format tests.
- `npm run lint` checks the source for common issues.
- `npm run build` creates the deployable site in `dist/`.

## Deploy to Vercel

Import this folder as a Vercel project. Use `npm run build` as the build command and `dist` as the output directory. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel’s environment variables for each environment, and add the Vercel URL to Supabase’s allowed redirect URLs. No server-side secret is used in the browser.

## Features and boundaries

- Search, year/author/open-access filters, paper details, citation metadata, and known open-access full-text links come from OpenAlex. API availability and metadata vary by record.
- Paper details include a free local PDF scan: open the catalogued free copy, download its PDF, then upload it into PaperPilot. PDF text is extracted in the browser and is not uploaded to PaperPilot or an AI service. The phrase-based scan shows matching sentences and page numbers for possible research gaps, limitations, and author-stated future work; it does not generate or verify scientific conclusions. Abstract-only scanning remains available when you do not have a PDF.
- Saved papers, collections, reading status, tags, and notes sync through Supabase for the signed-in account. Export the library as CSV and notes as Markdown; copy citations in APA, MLA, or BibTeX format.
- A first-time guide explains the main research workflow and can be reopened from the sparkle button in the top bar.
- Supabase Auth handles signup, email confirmation, login, logout, and password reset. Database row-level security isolates each user’s library.
- This version does not include shared workspaces, billing, institutional access management, or a custom backend server. Supabase provides the managed authentication and database backend.
