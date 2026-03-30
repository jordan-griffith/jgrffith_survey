# Working Notes — Music Listening Survey

> **INTERNAL DOCUMENT — NOT PUBLIC FACING.**
> This file is for the developer and any AI assistants working on this project.
> Update this file at the end of every working session before closing.

---

## How to Use This File (For AI Assistants)

1. Read this entire file before doing anything else.
2. Read `README.md` for public-facing context, installation steps, and the Supabase SQL schema.
3. Do not change the folder structure, file naming conventions, or monorepo layout without discussing it first.
4. Follow all conventions in the **Conventions** section exactly — naming, code style, commit style.
5. Do not suggest anything listed in **What Was Tried and Rejected**.
6. Ask before making large structural changes (e.g., switching routers, replacing the Supabase client, restructuring the monorepo).
7. This project was AI-assisted — refactor conservatively. Prefer targeted edits over wholesale rewrites.
8. The workspace is a pnpm monorepo. Always run commands with `--filter @workspace/music-survey` unless operating at the repo root.

---

## Current State

**Last Updated:** 2026-03-30

The survey application is fully built and running locally on Replit. The Supabase table must be created manually by running the SQL in `README.md` before form submissions will work. The Azure deployment pipeline is configured but has not been tested end-to-end — it requires the GitHub repo to be created, three secrets to be added, and the Azure Static Web App resource to be linked.

### What Is Working
- [x] Home page (`/`) with links to survey and results
- [x] Survey form (`/survey`) with all four questions and full validation
- [x] Conditional "Other" location text input with auto-focus on check
- [x] Inline accessible error messages (`aria-describedby`, `role="alert"`)
- [x] Thank-you confirmation screen showing the respondent's own answers
- [x] Results page (`/results`) with total count and three Recharts visualizations
- [x] "Other" location normalization (case-insensitive deduplication, expanded as individual bars)
- [x] Supabase client configured via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [x] `staticwebapp.config.json` in `public/` for Azure SPA routing fallback
- [x] GitHub Actions workflow at `.github/workflows/azure-static-web-apps.yml`
- [x] `vite.config.ts` patched to not require `PORT` or `BASE_PATH` during CI builds

### What Is Partially Built
- [ ] Azure deployment — workflow is written but not yet tested against a live Azure resource
- [ ] Results page auto-refresh — currently requires a manual page reload to see new submissions

### What Is Not Started
- [ ] Duplicate-submission guard (localStorage or session cookie)
- [ ] Supabase Realtime subscription for live results updates
- [ ] Top Artists chart on the results page
- [ ] CSV export of results
- [ ] Admin/instructor view with raw response data

---

## Current Task

The survey app is complete and running. The last session focused on preparing it for Azure Static Web Apps deployment: the Vite config was patched to remove hard `PORT`/`BASE_PATH` requirements, and a GitHub Actions workflow was created.

**Next step:** Push the repository to GitHub, create an Azure Static Web App resource, add the three required secrets (`AZURE_STATIC_WEB_APPS_API_TOKEN`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) to the repo, and trigger the first deployment by pushing to `main`.

---

## Architecture and Tech Stack

| Technology | Version | Why It Was Chosen |
|---|---|---|
| React | 18 (catalog) | Standard UI library; required by the monorepo template |
| TypeScript | ~5.9.2 | Workspace-wide static typing; required by monorepo template |
| Vite | catalog | Fast bundler; required by the react-vite artifact type |
| Tailwind CSS | v4 (catalog) | Utility-first styling; pre-configured in the scaffold |
| `@supabase/supabase-js` | latest | Official Supabase client; connects browser directly to Supabase |
| Supabase (PostgreSQL) | cloud | Specified in the PRD; student already had an account |
| Recharts | ^2.15.2 | Pre-included in scaffold; declarative React chart library |
| Wouter | ^3.3.5 | Lightweight client-side router; pre-included in scaffold |
| pnpm workspaces | 10 | Monorepo package manager required by Replit template |
| Azure Static Web Apps | — | Specified in the PRD for hosting |

---

## Project Structure Notes

```
music-survey/                          # Repo root
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml  # CI/CD — builds with pnpm, deploys pre-built dist/
├── artifacts/
│   ├── api-server/                    # Express API server (NOT used by this survey app)
│   ├── mockup-sandbox/                # Replit design canvas sandbox (NOT used)
│   └── music-survey/                  # The actual survey application
│       ├── public/
│       │   └── staticwebapp.config.json  # Azure SPA routing fallback (rewrite to index.html)
│       ├── src/
│       │   ├── lib/
│       │   │   └── supabase.ts        # Supabase client + SurveyResponse/SurveyInsert types
│       │   ├── pages/
│       │   │   ├── HomePage.tsx       # Landing page — nav buttons only
│       │   │   ├── SurveyPage.tsx     # Form + thank-you screen (single component, conditional render)
│       │   │   └── ResultsPage.tsx    # Aggregated results + 3 Recharts charts
│       │   ├── App.tsx                # Wouter router — 3 routes: /, /survey, /results
│       │   ├── index.css              # Tailwind v4 @theme block; accent color #8A3BDB = HSL(270,69%,55%)
│       │   └── main.tsx               # React DOM entry point
│       ├── package.json               # Artifact dependencies
│       ├── tsconfig.json              # noEmit, bundler resolution, paths alias @/* → src/*
│       └── vite.config.ts             # PORT optional (dev only), BASE_PATH defaults to "/"
├── lib/                               # Shared generated libraries (not touched by this app)
├── README.md                          # Public-facing documentation
├── WORKING_NOTES.md                   # This file
├── pnpm-workspace.yaml                # Workspace package discovery
├── tsconfig.base.json                 # Shared TS compiler options
└── package.json                       # Root dev tooling
```

### Non-obvious decisions

- **`SurveyPage.tsx` handles both the form and the thank-you screen** in a single component using a `submitted` state flag. This avoids a route change so the URL stays at `/survey` after submission, which is intentional — navigating away would require passing submitted data through router state.
- **`artifacts/api-server/` is not used by this app.** The survey connects directly from the browser to Supabase. The Express server exists because the Replit monorepo template includes it, but it plays no role here.
- **`dist/public/` is the Vite output directory** (not `dist/`). This is set explicitly in `vite.config.ts` via `outDir`. The Azure workflow's `app_location` points here.

### Files that must not be changed without discussion

- `pnpm-workspace.yaml` — changing package discovery breaks all workspace commands
- `tsconfig.base.json` — shared compiler options; changes affect all packages
- `artifacts/music-survey/vite.config.ts` — the `BASE_PATH` default and optional `PORT` logic is required for Azure builds to work
- `.github/workflows/azure-static-web-apps.yml` — the `skip_app_build: true` flag and `app_location` path are carefully set; do not let Azure override with an auto-generated workflow

---

## Data / Database

**Provider:** Supabase (PostgreSQL), project ID `slnsnigmnchwukrchnoa`

### Table: `public.survey_responses`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `uuid` | auto | `gen_random_uuid()` primary key |
| `created_at` | `timestamptz` | auto | `now()` default, not null |
| `favorite_artist` | `text` | yes | Free-text, trimmed before insert |
| `favorite_genre` | `text` | yes | One of 20 fixed genre strings from the dropdown |
| `hours_per_week` | `text` | yes | One of 5 fixed strings: "0–1 Hours" … "26+ Hours" (en-dash, not hyphen) |
| `locations` | `text[]` | yes | Array; values are the checkbox labels (e.g. `["Gym","Car","Other"]`) |
| `other_location` | `text` | no | Populated only when `locations` includes `"Other"`; null otherwise |

**Row Level Security:** enabled. Two policies — anonymous `INSERT` (no check), anonymous `SELECT` (no filter). No authentication required.

**Important:** The hours strings use an **en-dash** (`–`, U+2013), not a hyphen-minus (`-`). This must match exactly between the form radio options and any query/display logic.

---

## Conventions

### Naming Conventions

- React components: PascalCase (`SurveyPage`, `ChartSection`)
- Files: PascalCase for components (`SurveyPage.tsx`), camelCase for utilities (`supabase.ts`)
- State variables: camelCase, descriptive (`submitError`, `showOtherInput`)
- Supabase column names: snake_case, matching the PostgreSQL table definition exactly
- CSS custom properties: kebab-case (`--tw-ring-color`)

### Code Style

- TypeScript strict mode; no `any` types
- Interfaces over type aliases for object shapes (`FormData`, `FormErrors`, `SurveyResponse`)
- Inline `style` props for the accent color `#8A3BDB` — do not add it as a Tailwind arbitrary value or CSS variable, as the exact hex is used directly throughout
- Error messages are plain English sentences ending with a period
- No default exports from utility files (`supabase.ts` uses named exports for types)

### Framework Patterns

- Wouter `<Link>` renders an `<a>` tag directly — do **not** wrap it in another `<a>` element (causes hydration errors from nested anchors)
- Form validation runs entirely on the client before the Supabase insert; there is no server-side validation
- All Recharts charts use `<Cell>` components to apply the accent color per bar rather than a single `fill` on `<Bar>` — this is required because `<Cell>` allows future per-bar color differentiation
- `aria-describedby` links each input to its error `<p>` using the pattern `err-{fieldName}`

### Git Commit Style

Conventional Commits format:
```
feat: add top artists chart to results page
fix: correct en-dash in hours_per_week radio options
chore: update WORKING_NOTES after session
docs: expand Azure deployment steps in README
```

---

## Decisions and Tradeoffs

- **Direct browser-to-Supabase connection (no API server).** The Express server in `artifacts/api-server/` is not used. This simplifies deployment to a static site but means all access control must be enforced by Supabase RLS policies, not server-side logic. Do not suggest adding an API proxy unless there is a concrete security requirement.
- **Client-side rendering only.** No SSR or SSG. The survey is short and doesn't need SEO. Azure Static Web Apps serves `index.html` for all routes via `staticwebapp.config.json`.
- **No authentication.** The PRD explicitly states this is a public survey. Row Level Security allows anonymous reads and inserts. Do not suggest adding auth unless requirements change.
- **`BASE_PATH` defaults to `"/"` in production.** On Replit, `BASE_PATH` is injected as a sub-path prefix. On Azure the app sits at the domain root, so the default is correct. Do not revert to a hard requirement.
- **Single component for form + thank-you screen.** The thank-you screen is rendered inside `SurveyPage` rather than as a separate route so the submitted form data is available without router state or a redirect. Do not split these into separate routes without a clear reason.
- **Pre-built deployment to Azure.** The GitHub Actions workflow builds with `pnpm` and deploys the `dist/public/` folder with `skip_app_build: true`, bypassing Azure's built-in Oryx builder. This is necessary because Oryx does not understand pnpm workspaces.

---

## What Was Tried and Rejected

- **Using Replit's built-in PostgreSQL (Drizzle ORM) instead of Supabase.** The PRD specifically requires Supabase. Do not suggest switching to the built-in DB.
- **Wrapping `<Link>` in an `<a>` tag** (e.g., `<Link href="..."><a className="...">...</a></Link>`). This produces nested anchor elements and a React hydration error. Use `<Link>` with className directly.
- **Requiring `PORT` as a hard environment variable in `vite.config.ts`.** This crashes `vite build` in any CI environment that doesn't set `PORT`. Fixed to be optional.
- **Requiring `BASE_PATH` as a hard environment variable.** Same issue for Azure builds. Fixed to default to `"/"`.
- **Letting Azure run its own build step** (setting `app_location` to the source directory and `output_location` to `dist/public`). Azure's Oryx builder does not install pnpm or understand the workspace setup. Using `skip_app_build: true` with a pre-built output directory is the correct approach for pnpm monorepos.

---

## Known Issues and Workarounds

**Issue:** The results page does not update in real time — new submissions appear only after a manual page refresh.
**Workaround:** None currently. The user must reload the page.
**Notes:** Supabase Realtime could solve this but has not been implemented. Do not remove the manual fetch in `useEffect` — it is the only data-loading mechanism right now.

---

**Issue:** The hours-per-week strings use an en-dash (`–`) not a hyphen (`-`). If a future developer changes the radio option labels in `SurveyPage.tsx`, the `hoursOrder` array in `ResultsPage.tsx` must be updated to match, and any existing database rows with the old string will stop appearing in the chart.
**Workaround:** The strings are currently consistent. Do not change them without migrating existing data.

---

**Issue:** No rate limiting or duplicate-submission prevention. A user can submit the form multiple times.
**Workaround:** None. The Supabase RLS policy allows unlimited anonymous inserts by design (public survey). A localStorage flag would prevent accidental double-submits but not deliberate ones.

---

## Browser / Environment Compatibility

### Front-end

- Tested on: Chrome (latest), Safari (iOS, latest) via Replit preview
- Expected support: all modern evergreen browsers (Chrome, Edge, Firefox, Safari)
- Known incompatibilities: `accentColor` CSS property is not supported in IE 11 (not a concern for this audience)
- `hsl(from ...)` relative color syntax in `index.css` (used for computed button borders) requires Chrome 119+, Safari 16.4+, Firefox 128+ — all current versions

### Back-end / Build Environment

- Node.js: 20 (LTS) — specified in `.github/workflows/azure-static-web-apps.yml`
- pnpm: 10 — specified in the workflow and enforced by the root `package.json` preinstall check
- Replit environment: Node 24 (as of workspace creation) — no issues because the app is frontend-only
- Azure Static Web Apps: served as static files; no server runtime involved

---

## Open Questions

- Should the results page be protected in any way, or is fully public access intentional for a class assignment? (Currently fully public — anyone with the URL can see aggregate results.)
- Should there be a submission deadline after which the form is closed and only results are shown?
- Is the 20-genre dropdown list final, or does it need to be configurable by the instructor?
- What happens to the Supabase project after the course ends — does it need to be exported or migrated?

---

## Session Log

### 2026-03-30

**Accomplished:**
- Built the complete survey application from the PRD (home page, survey form with 4 questions, thank-you confirmation, results page with 3 charts)
- Integrated Supabase directly from the browser using `@supabase/supabase-js`
- Fixed nested `<Link>/<a>` hydration error
- Patched `vite.config.ts` to make `PORT` and `BASE_PATH` optional for CI/CD compatibility
- Created `.github/workflows/azure-static-web-apps.yml` for Azure Static Web Apps deployment
- Generated `README.md` and `WORKING_NOTES.md`
- Stored `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Replit environment variables

**Left Incomplete:**
- Azure deployment not yet tested end-to-end (requires GitHub repo + Azure resource creation)
- Supabase table not confirmed to exist yet (SQL provided in README, must be run manually)

**Decisions Made:**
- Use `skip_app_build: true` in the Azure workflow to bypass Oryx and deploy the pre-built `dist/public/` directory
- Keep the form and thank-you screen in a single component to avoid router state complexity

**Next Step:** Push to GitHub, create the Azure Static Web App, add the three secrets, and verify the first deployment completes successfully.

---

## Useful References

- [Supabase JavaScript Client docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Row Level Security guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Recharts API reference](https://recharts.org/en-US/api)
- [Azure Static Web Apps — GitHub Actions](https://learn.microsoft.com/en-us/azure/static-web-apps/github-actions-workflow)
- [Azure SWA — `skip_app_build` option](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration?tabs=github-actions#skip-building-front-end-app)
- [pnpm `action-setup` GitHub Action](https://github.com/pnpm/action-setup)
- [Wouter v3 documentation](https://github.com/molefrog/wouter)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- **AI tools used:** Replit Agent (Claude) — used for full application scaffolding, debugging, README generation, Azure deployment configuration, and this working notes document. All generated code was reviewed for correctness against the PRD before acceptance.
