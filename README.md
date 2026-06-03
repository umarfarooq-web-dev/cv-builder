# Professional CV Builder

A React + TypeScript CV builder with live preview, Zod validation, and accessible error handling.

## Features

- **Personal info** (always included) plus **13 optional sections** you can toggle on or off
- **Sections:** summary, experience, education, skills, projects, **articles**, **blogs**, certifications, languages, volunteer work, awards, references, interests
- **Live preview** shows only enabled sections
- **Conditional validation** — only enabled sections are validated (Zod + React Hook Form)
- **Save draft** to browser localStorage (merged with defaults on load for older drafts)
- **Download PDF** — exports only your CV (no browser print header/footer with URL or date)
- **Save to Supabase** — posts validated `CvFormData` JSON to PostgreSQL

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run migrations in order:
   - `supabase/migrations/001_cv_schema.sql`
   - `supabase/migrations/002_users_and_profiles.sql`
   - `supabase/migrations/003_rest_insert_policies.sql`
3. Enable **Email** auth under Authentication → Providers (for sign up / sign in).
4. Copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL` — Project Settings → API → Project URL
   - `VITE_SUPABASE_ANON_KEY` — Project Settings → API → anon public key
5. Restart `npm run dev`, **sign up / sign in** (header), fill the form, **Validate CV**, then **Save to Supabase**.

### Database layout

| Table | Purpose |
| ----- | -------- |
| `users` | App user row (1:1 with `auth.users`) |
| `profiles` | Account profile (name, avatar, contact) — 1 per user |
| `cv_profiles` | CV document + `payload` JSON; optional `user_id` owner |

| Table | Maps to JSON |
| ----- | ------------- |
| `cv_profiles` | `sections`, `personal`, `summary`, `skills`, `interests`, plus `payload` (full JSON) |
| `cv_experiences` | `experiences[]` |
| `cv_education` | `education[]` |
| `cv_projects` | `projects[]` |
| `cv_articles` | `articles[]` |
| `cv_blogs` | `blogs[]` |
| `cv_certifications` | `certifications[]` |
| `cv_languages` | `languages[]` |
| `cv_volunteer` | `volunteer[]` |
| `cv_awards` | `awards[]` |
| `cv_references` | `references[]` |

Saves use **one Supabase REST call**: `supabase.from('cv_profiles').insert({ ... })`. Full JSON lives in `payload`; a DB trigger updates `profiles` when `user_id` is set.

Optional migration `003_rest_insert_policies.sql` adds insert RLS + profile sync trigger (no RPC needed).

JSON Schema reference: `supabase/cv-form-data.schema.json`

## Getting started

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start development server |
| `npm run build`| Production build         |
| `npm run preview` | Preview production build |

## Tech stack

- Vite
- React 19
- TypeScript
- react-hook-form + @hookform/resolvers
- Zod
- Supabase (PostgreSQL)
