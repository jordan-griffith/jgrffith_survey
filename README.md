# Music Listening Survey

## Description

A short web-based survey application that collects music listening habits from undergraduate business students at the University of Iowa. It captures each respondent's favorite artist, preferred genre, weekly listening hours, and where they listen to music — then displays aggregated, anonymized results as interactive charts. Built for BAIS:3300 as a data-collection and visualization exercise, it stores all responses in a Supabase PostgreSQL database and requires no user accounts or authentication.

## Badges

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Azure Static Web Apps](https://img.shields.io/badge/Azure_Static_Web_Apps-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

## Features

- **Four-question survey** covering favorite artist, genre, weekly listening hours, and listening locations
- **Conditional "Other" field** — a text input appears automatically when the "Other" location checkbox is checked, and focus moves to it instantly
- **Inline form validation** with accessible error messages linked to their fields via `aria-describedby`
- **Thank-you confirmation screen** that summarizes the respondent's answers immediately after submission
- **Aggregated results page** at `/results` showing three interactive Recharts visualizations — no individual responses are ever displayed
- **"Other" location normalization** — user-entered custom locations are cased consistently and appear as individual bars alongside standard options
- **Fully responsive layout** designed for phones, tablets, and desktops with a single-column form on small screens
- **WCAG 2.1 Level AA accessibility** — all inputs have associated labels, keyboard navigation is fully supported, and color is never the sole indicator of state

## Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | UI component library and rendering |
| TypeScript | Static typing across the entire codebase |
| Vite | Dev server and production bundler |
| Tailwind CSS v4 | Utility-first styling |
| Supabase (PostgreSQL) | Cloud database for storing and querying survey responses |
| `@supabase/supabase-js` | Supabase client for direct browser-to-database calls |
| Recharts | Declarative charting library for the results visualizations |
| Wouter | Lightweight client-side router (`/`, `/survey`, `/results`) |
| pnpm workspaces | Monorepo package management |
| Azure Static Web Apps | Production hosting with client-side routing fallback |

## Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/) (LTS recommended)
- [pnpm 9+](https://pnpm.io/installation) — `npm install -g pnpm`
- A [Supabase](https://supabase.com/) project with the table created (see SQL below)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/music-survey.git
   cd music-survey
   ```

2. Install all workspace dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file inside `artifacts/music-survey/` with your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
   Both values are found in your Supabase dashboard under **Project Settings → API**.

4. In the Supabase **SQL Editor**, run the following to create the table and configure Row Level Security:
   ```sql
   CREATE TABLE public.survey_responses (
     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     created_at timestamptz DEFAULT now() NOT NULL,
     favorite_artist text NOT NULL,
     favorite_genre text NOT NULL,
     hours_per_week text NOT NULL,
     locations text[] NOT NULL,
     other_location text
   );

   ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Allow anonymous inserts"
     ON public.survey_responses FOR INSERT TO anon WITH CHECK (true);

   CREATE POLICY "Allow anonymous reads"
     ON public.survey_responses FOR SELECT TO anon USING (true);
   ```

5. Start the development server:
   ```bash
   pnpm --filter @workspace/music-survey run dev
   ```

6. Open your browser at `http://localhost:<PORT>` (the port is printed in the terminal).

## Usage

| Route | Description |
|---|---|
| `/` | Home page — links to the survey and results |
| `/survey` | Four-question survey form; submits to Supabase on completion |
| `/results` | Aggregated results with three charts and a total response count |

**Environment variables:**

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

Both variables must be prefixed with `VITE_` so Vite embeds them in the client bundle at build time. They are **not** secret — Supabase Row Level Security policies control what anonymous users can read or write.

## Project Structure

```
music-survey/
├── artifacts/
│   └── music-survey/               # React + Vite frontend artifact
│       ├── public/
│       │   └── staticwebapp.config.json  # Azure routing fallback for SPA
│       ├── src/
│       │   ├── lib/
│       │   │   └── supabase.ts     # Supabase client instance and shared types
│       │   ├── pages/
│       │   │   ├── HomePage.tsx    # Landing page with navigation buttons
│       │   │   ├── SurveyPage.tsx  # Survey form + thank-you confirmation screen
│       │   │   └── ResultsPage.tsx # Aggregated results with Recharts visualizations
│       │   ├── App.tsx             # Wouter router — mounts all three routes
│       │   ├── index.css           # Tailwind v4 theme with #8A3BDB accent color
│       │   └── main.tsx            # React DOM entry point
│       ├── package.json            # Artifact dependencies (React, Recharts, Supabase…)
│       ├── tsconfig.json           # TypeScript config (bundler resolution, no emit)
│       └── vite.config.ts          # Vite config — reads PORT and BASE_PATH from env
├── lib/
│   ├── api-spec/                   # OpenAPI 3.1 spec + Orval codegen config
│   ├── api-client-react/           # Generated React Query hooks (from OpenAPI)
│   ├── api-zod/                    # Generated Zod schemas (from OpenAPI)
│   └── db/                        # Drizzle ORM schema + PostgreSQL connection
├── artifacts/api-server/           # Express 5 API server (workspace backend)
├── pnpm-workspace.yaml             # pnpm workspace package discovery
├── tsconfig.base.json              # Shared TypeScript compiler options
├── tsconfig.json                   # Root TS solution file (composite libs)
├── package.json                    # Root dev tooling (TypeScript, Prettier)
└── README.md                       # This file
```

## Changelog

### v1.0.0 — 2026-03-30

- Initial release
- Home, survey, and results pages
- Supabase integration for storing and reading responses
- Four survey questions: favorite artist, genre, hours/week, listening locations
- Conditional "Other" location text input with auto-focus
- Full inline form validation with WCAG-compliant error messaging
- Three Recharts visualizations on the results page: genre bar chart, hours/week bar chart, locations horizontal bar chart
- "Other" location normalization and case-insensitive deduplication
- Azure Static Web Apps deployment config (`staticwebapp.config.json`)
- Responsive layout for mobile, tablet, and desktop

## Known Issues / To-Do

- [ ] The results page does not auto-refresh; a manual page reload is required to see new responses after they are submitted
- [ ] The genre dropdown does not support searching or filtering, which can be slow to navigate on mobile keyboards
- [ ] No server-side rate limiting on inserts — a determined user could submit the form repeatedly and inflate response counts

## Roadmap

- Add a duplicate-submission guard using a session cookie or localStorage flag so each device can only submit once
- Implement real-time results updates using Supabase's Realtime subscription API so the results page reflects new responses without a page refresh
- Add a "Top Artists" chart to the results page showing the most frequently named artists (with normalized casing)
- Export results as a downloadable CSV from the results page for use in spreadsheet analysis
- Add an admin-protected route that shows raw response data for the course instructor

## Contributing

Contributions are welcome for bug fixes and improvements. Please open an issue first to discuss any significant changes so we can align on approach before you invest time in a pull request.

1. Fork the repository on GitHub
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes with a descriptive message: `git commit -m "feat: describe your change"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request against the `main` branch and fill out the PR template

## License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute this software with attribution.

## Author

**Jordan Griffith**  
University of Iowa  
BAIS:3300 Business Analytics and Information Systems — Spring 2026

## Contact

GitHub: [https://github.com/jordangriffith](https://github.com/jordangriffith)

## Acknowledgements

- [Supabase Documentation](https://supabase.com/docs) — for the Row Level Security policy examples and JavaScript client reference
- [Recharts Documentation](https://recharts.org/en-US/) — for the `BarChart`, `ResponsiveContainer`, and `Cell` component APIs
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs) — for the `@theme` inline variable system and utility reference
- [Wouter](https://github.com/molefrog/wouter) — lightweight React router used for client-side navigation
- [shields.io](https://shields.io/) — for the badge images in this README
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/) — for accessibility requirements referenced throughout the project
- [Replit Agent](https://replit.com/) — AI coding assistant used to scaffold, build, and debug this application
