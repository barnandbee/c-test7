# Training week

A personal weekly training pick list. Instead of fixed days, you complete a set number of sessions per category each week (easy runs, a spice run, strength, mobility and an optional bonus). Pick an activity from the library, add it to a day, and tap it to mark it done.

Made by Bass Moultapps.

Live at **https://barnandbee.github.io/c-test7/**

Everything runs in the browser. There is no server and no account, and your data never leaves your device. It can be installed on your phone's home screen and works offline.

## Install on your phone

- **iPhone (Safari):** open the site, tap **Share**, then **Add to Home Screen**.
- **Android (Chrome):** open the site, tap the **⋮** menu, then **Install app** (or **Add to Home screen**).

After the first visit the whole app is stored on the phone, so it opens and works with no signal. Links to YouTube videos and articles still need a connection.

When a new version has been deployed, the app shows "A new version of the app is ready" with a **Reload** button. Your data isn't affected by updates.

Installing it also helps keep your data safe: Safari can clear storage for websites you haven't visited in a while, but not for apps on your home screen.

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
  paces: ["tempo", "easy"], // optional, runs only: which of your paces to show, main effort first
                            // race | tempo | long | easy | recovery
}
```

- To add an activity, copy an existing one, give it a new `id`, and edit the text.
- To remove an activity, delete it. Past sessions keep their own copy of the title and category, so your history isn't affected.
- Don't reuse an old `id` for a different activity.
- Run `npm run build` afterwards. TypeScript will point out typos in field names or categories.

You can also make your own activities in the app (Library → New activity, or Duplicate on any activity). Those are stored with your data, not in this file.

## Paces

The Paces tab works out your training paces from your current 5km time (from a recent race or your watch's race predictor). Update the time whenever it changes and every pace follows, including the paces shown on run cards in the library.

- 5km race pace: 5km time ÷ 5
- Tempo: 25–30 seconds per mile slower than 5km pace (about 16–19 seconds per km)
- Easy: 25–32% slower than 5km pace
- Long run: 45 seconds to 1:30 per km slower than 5km pace
- Recovery: from the slow end of easy to 30 seconds per km slower
- 10km: your own time if entered, otherwise predicted from 5km with Riegel's formula

You can set your own easy and tempo ranges instead. The rules live in `src/lib/paces.ts`. Your times are stored only in your browser, never in this repository.

## Stats

The Stats tab shows:

- **Streaks:** the current and longest run of weeks where every target except Bonus was met. This week counts once it's met, and doesn't break the streak while it's in progress.
- **Weekly completion** over the last 4, 12 and 52 full weeks: the share of target sessions done (each category capped at its target, Bonus left out), and how many of those weeks had every target met. It only counts weeks since your first session.
- **Running distance** per week or month for the last 12, from the distances you log on easy and spice runs.
- **Sessions by category and by activity**, the most-used activities and your favourites.
- **Strength progression:** weight and reps over time for each exercise you've logged.

Every chart has a "Show as a table" option.

### Rosettes

Twenty awards for goals reached along the way: first session, streaks, total sessions, running distance, spice, hill and tempo runs, strength, heavier weights, mobility, neck and shoulders sessions, bonus sessions and trying different activities. Each one shows your progress until you win it.

They're defined in [`src/data/rosettes.ts`](src/data/rosettes.ts). Each has a name, a description, a short `mark` shown in the middle (up to 4 characters), a colour (a category, or `award`), a `goal`, and a `value` worked out from the facts in `src/lib/rosettes.ts`. Rosettes are worked out from your sessions each time, so changing a goal never loses anything.

## Calendar

On the Week tab, each planned session has a calendar button. Pick a start time and length (or all day) and it downloads a `.ics` calendar file. On an iPhone, tap the file to add it to Calendar. The event notes include the steps, exercises, links and your current paces for that run.

## Your data

Data is saved in your browser's `localStorage` under the key `training-week:data`. It's stored per browser and per device: your phone and your laptop each keep their own copy.

The stored data has a `version` number. When the data shape changes, a migration in `src/lib/migrations.ts` upgrades older data on load, so updates never wipe your history. If stored data can't be read, the app shows a warning and doesn't save over it.

### Back up and restore

Go to **Settings → Back up and restore**.

- **Export backup** downloads `training-week-backup-YYYY-MM-DD.json` with everything: sessions and logs, your own activities, favourites, targets and paces. On an iPhone it goes to the Files app (Downloads).
- **Import backup…** reads one of those files and **replaces** everything on this device, after asking you to confirm. Backups from older versions of the app are upgraded automatically.

To move to a new phone: export on the old one, send yourself the file, then import it on the new one.

If the app ever says it couldn't read your saved data, it stops saving so nothing gets overwritten. Importing a backup fixes that.

Never commit backup files to this repository, because it's public. `.gitignore` already excludes files named `training-week-backup*.json`.
