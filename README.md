# Professional CV Builder

A React + TypeScript CV builder with live preview, Zod validation, and accessible error handling.

## Features

- **Personal info** (always included) plus **13 optional sections** you can toggle on or off
- **Sections:** summary, experience, education, skills, projects, **articles**, **blogs**, certifications, languages, volunteer work, awards, references, interests
- **Live preview** shows only enabled sections
- **Conditional validation** — only enabled sections are validated (Zod + React Hook Form)
- **Save draft** to browser localStorage (merged with defaults on load for older drafts)
- **Download PDF** — exports only your CV (no browser print header/footer with URL or date)

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
