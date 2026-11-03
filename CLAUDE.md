# CLAUDE.md

Personal fitness "pick list" web app. Static site, no backend, single user. Hosted on GitHub Pages at `/c-test7/`.

## Stack
- Vite + Preact + TypeScript (strict). No router library, no state library.
- Vitest for unit tests of pure logic in `src/lib/`.
- Fonts are self-hosted via `@fontsource` (Oswald for display, Barlow for body). Don't add Google Fonts links.

## Commands
- `npm run dev` – dev server
- `npm test` – unit tests (run before every commit)
- `npm run build` – `tsc --noEmit` then `vite build` (run before every commit)

## Layout
- `src/data/` – editable content: `library.ts` (built-in activities), `categories.ts` and `rosettes.ts` (awards). Keep content out of UI code.
- `src/lib/` – pure, tested logic (dates, storage, migrations, targets, spacing, sessions/logs, activities/favourites, paces, stats, rosettes, calendar files (`ics.ts`), backup, number parsing, chart ticks). No DOM or Preact imports here, except `storage.ts`, which takes a `Storage` argument so tests can pass a fake.
- `src/route.ts` – hash routing (`#/`, `#/library`, `#/paces`, `#/stats`, `#/settings`). No router library.
- `src/views/` – one component per tab. `src/components/` – shared pieces. Modals use `Sheet` (native `<dialog>`); `app.tsx` owns which one is open.
- State lives in `app.tsx` and changes through `update(fn)`, where `fn` is a pure `AppData → AppData` function from `src/lib/`.
- `src/download.ts` – saves a text file (backups, calendar files). `src/components/UpdateBanner.tsx` registers the service worker.
- `src/styles/tokens.css` – all colours. `app.css` – layout. `components.css` – everything added since.

## Conventions
- **British English** everywhere: UI text, comments, docs ("colour", "favourites", "kilometre").
- Plain, direct UI copy. No exclamation marks or marketing tone.
- Dates are local `YYYY-MM-DD` strings. Weeks run Monday to Sunday. Use the helpers in `src/lib/dates.ts`; don't do date maths with milliseconds.
- Sessions store a `snapshot` of the activity (title, short, category, legs, neck) so history survives library edits. Logic such as targets and spacing reads from the snapshot, not from the library.
- Activity `id`s are permanent. Never rename one in `library.ts`. Custom activity ids start with `custom-`, and deleted ones are kept with `deleted: true` so past sessions still resolve.
- Number inputs use `inputMode="decimal"` text fields parsed by `src/lib/numbers.ts` (accepts "5,2"), and times use `parseTime` (accepts "22:45" or "22.45"), because phone number pads may lack ":".
- Category colours come from CSS custom properties `--easy`, `--spice` and so on. Set `--c` on an element to theme it by category. Any new colour must meet WCAG AA in light and dark.
- Charts are plain SVG in `src/components/Charts.tsx`: single series only (never two y-axes), hover and keyboard tooltips, and a "Show as a table" view. Category colours fail colour-blind separation as a chart palette (rust and brown are close), so any chart by category must label every mark with its name.
- Accessibility: real `<button>`s, visible `:focus-visible`, `aria-pressed` and `aria-expanded` where relevant, and respect `prefers-reduced-motion`. Mobile-first, with 40px+ tap targets.

## Data and storage
- One JSON document in `localStorage` (`training-week:data`), shaped as `AppData` in `src/types.ts`.
- **Changing the data shape:** bump `CURRENT_VERSION` in `src/lib/migrations.ts`, add a migration from the previous version, and add a test. Never edit an old migration. `normalise()` fills defaults for optional fields.
- If stored data fails to load, the app must not save over it.
- The repo is public. Never commit personal data (race times, logs), exported backups, or names or identifying details in library text. Defaults in code must be empty.

## Offline (PWA)
- `vite-plugin-pwa` in `vite.config.ts` generates the manifest and a Workbox service worker that precaches the whole build, fonts included.
- `registerType: "prompt"`: a new version waits until the user taps Reload in `UpdateBanner`. Don't switch to auto-reload; it could drop a half-filled form.
- Icons live in `public/icons/` and are made from the Bass Moultapps logo. The maskable icon keeps the logo inside the central 80%.
- If you add a new kind of static file, check it's covered by `workbox.globPatterns`.

## Deploy
- `.github/workflows/deploy.yml`: PRs build and test only. Pushes to `main` deploy to Pages.
- Work happens on feature branches, which are merged into `main` by PR.
