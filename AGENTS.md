# AGENTS.md

Static Spanish-language site ("Nuestra Huella por Venezuela") built with Astro + Tailwind CSS v4. The README is still the unmodified Astro starter — trust `package.json` and `astro.config.mjs` over it.

## Commands

Package manager is **pnpm** (`pnpm-lock.yaml`). Node `>=22.12.0`.

```sh
pnpm install
pnpm dev        # dev server on localhost:4321
pnpm build      # static output to dist/
pnpm preview
```

There is **no** lint, typecheck, test, or CI setup. Don't invent commands; `pnpm astro check` would try to install `@astrojs/check`. Verify changes with `pnpm build`.

## Language and git workflow

- **UI copy is Spanish.** Code identifiers, comments, docs, commit messages, and PR descriptions are **English**.
- `develop` is the integration branch; `main` is not worked on directly.
- Create one branch per feature from `develop`: `feature/<short-name>` (e.g. `feature/interactive-map`).

## Site scope (schematic, not final)

Sections planned for the site. Keep this list updated as they take shape:

1. Home / hero: site name, Venezuela imagery, short intro.
2. Upcoming trips.
3. Interactive Venezuela map (states visited; click opens a trip album).
4. Photo albums / trip posts.
5. About us.

## Tailwind v4 quirks

- Tailwind is wired through the `@tailwindcss/vite` plugin in `astro.config.mjs` — there is **no `tailwind.config.js`**.
- Theme tokens live in the `@theme` block in `src/styles/global.css` (`--color-heading`, `--color-body`). Add new tokens there, not in a config file.
- In component `<style>` blocks, `@apply` only works after `@reference "../styles/global.css"` (see `src/components/VenezuelaMap.astro`). Keep that line when adding scoped Tailwind styles.

## Map

- `src/components/VenezuelaMap.astro` renders on the home page (`src/pages/index.astro`).
- `public/Venezuela.svg` is imported as a string with `?raw` and injected via `<Fragment set:html>`, so its `<path>` elements stay in the DOM and remain targetable. Keep the `?raw` approach.
- `src/lib/venezuela-map.ts` decorates the SVG at build time: it adds `data-state` (slug), `data-name` (accented display name), and accessibility attributes to each state path. Target states with `[data-state]`, not raw ids.
- The vendor SVG has data quirks handled by that decorator: Zulia's path is `id="VEV"` (its `name` is `Zulia`), a label circle is misspelled `Cogedes`, ids mix accented/unaccented names, and some ids contain spaces. Never depend on the raw ids.
- The map must stay responsive: the SVG has fixed `width`/`height` attributes, so CSS forces `width: 100%; height: auto`.
- Clicking a state currently only highlights it; album navigation is not wired yet.

## Conventions

- Site copy is Spanish; UI text should stay Spanish unless asked otherwise.
- `astro/tsconfigs/strict` is extended. Injected SVG event handlers cast `e.target` as `any` because raw-SVG elements aren't statically typed.
- `public/Venezuela.svg` is the Simplemaps SVG (free for commercial use; attribution appreciated).
