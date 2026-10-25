# Training week

A personal weekly training pick list. Instead of fixed days, you complete a set number of sessions per category each week (easy runs, a spice run, strength, mobility and an optional bonus). Pick an activity from the library, add it to a day, and tap it to mark it done.

Made by Bass Moultapps.

Live at **https://barnandbee.github.io/c-test7/**

Everything runs in the browser. There is no server and no account, and your data never leaves your device.

## Run it locally

You need Node.js 22 or later.

```sh
npm install
npm run dev        # http://localhost:5173/c-test7/
npm test           # unit tests (Vitest)
npm run build      # type-check and build into dist/
npm run preview    # serve the built site at http://localhost:4173/c-test7/
```

## How deployment works

`.github/workflows/deploy.yml` runs on every pull request and on every push to `main`:

- **Pull requests** install, test and build. Nothing is deployed.
- **Pushes to `main`** (for example, merging a pull request) do the same, then publish `dist/` to GitHub Pages.

One-off setup: in the repository on GitHub, go to **Settings → Pages** and set **Source** to **GitHub Actions**.

The site is served from `/c-test7/`, which is set as `base` in `vite.config.ts`. If you rename the repository, change `base` to match.

## Editing the library

Built-in activities live in [`src/data/library.ts`](src/data/library.ts). Category names, notes and default weekly targets are in [`src/data/categories.ts`](src/data/categories.ts).

Each activity looks like this:

```ts
{
  id: "easy-5k",            // unique and permanent – never change it once used
  category: "easy",         // easy | spice | strength | mobility | bonus
  title: "Easy 5km",        // shown in the library
  short: "Easy 5km",        // shown on diary chips
  duration: "30–35 min",
  description: "Your normal 5km at …",
  steps: ["…", "…"],                              // optional, numbered list
  links: [{ label: "…", url: "https://…" }],      // optional
  exercises: [                                    // optional
    { name: "Goblet squat", dose: "10 reps · 5kg", howTo: "…" },
  ],
  legs: true,   // optional: leg-heavy, warns if planned the day before a spice run
  neck: true,   // optional: counts as the weekly neck and shoulders session
}
```

- To add an activity, copy an existing one, give it a new `id`, and edit the text.
- To remove an activity, delete it. Past sessions keep their own copy of the title and category, so your history isn't affected.
- Don't reuse an old `id` for a different activity.
- Run `npm run build` afterwards. TypeScript will point out typos in field names or categories.

## Your data

Data is saved in your browser's `localStorage` under the key `training-week:data`. It's stored per browser and per device: your phone and your laptop each keep their own copy.

The stored data has a `version` number. When the data shape changes, a migration in `src/lib/migrations.ts` upgrades older data on load, so updates never wipe your history. If stored data can't be read, the app shows a warning and doesn't save over it.

### Back up and restore

Export and import arrive in the next phase of development. This section will be updated then.

Never commit backup files to this repository, because it's public. `.gitignore` already excludes files named `training-week-backup*.json`.
