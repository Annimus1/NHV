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

Current state: the home page exists. The map renders and highlights states. The trip/place content model, schema, helpers, and sample fixtures exist, but trips, albums, upcoming trips, place/state pages, and the about section are not built yet.

## Content model

Content collections are defined in `src/content.config.ts` and validated at build time; invalid frontmatter fails `pnpm build`.

- `src/content/lugares/*.md` — canonical places. Fields: `name`, `state`, `coordinates` (`lat`/`lng`, decimal WGS84), `kind` (`beach`, `city`, `mountain`, `park`, `landmark`, `other`), `summary`, `draft`. A place is defined once and reused by every trip that visits it. The filename is the place slug (e.g. `/lugares/playa-choroni/`).
- `src/content/trips/*.md` — one album per trip. Fields: `title`, `summary`, `status`, `startDate`, `endDate`, `states[]`, `places[]`, `cover` (`{ src, alt }`), `photos[]` (`{ src, alt, caption?, place?, credit? }`), `featured`, `draft`. The filename is the trip slug (e.g. `/viajes/aragua-2026-08/`). The Markdown body is the trip story; `photos[]` is the album.
- `src/lib/venezuela-states.ts` — canonical list of the 25 state slugs and accented names. `states[]` and place `state` use `z.enum` from this list. Add states there, never as free strings.
- Repeat visits: create a new trip (new slug/date) that references the same place. Albums are never merged. Place and state pages will aggregate trips newest-first.
- Effective visited states are the union of a trip's explicit `states` and the states of its referenced `places`. `upcoming` trips do not mark states as visited; `ongoing` and `completed` do.
- `status` is explicit, not derived from dates (`upcoming`, `ongoing`, `completed`). Dates only drive ordering and display. Use `draft: true` to hide unfinished entries.
- Image paths in frontmatter are relative to the entry file (e.g. `../../assets/trips/aragua-2026-08/cover.jpg`). Photos live in `src/assets/trips/<trip-slug>/` as `cover.jpg` plus ordered `01-....jpg`. Export web-sized originals (max ~2400px long edge, sRGB, JPEG q~82, EXIF stripped). `alt` is required for covers and photos.
- Helpers live in `src/lib/trips.ts`: `getTrips`, `getUpcomingTrips`, `getPlaces`, `getTripsByState`, `getTripsByPlace`, `getTripStates`, `getVisitedStates`, `getTripPlaces`, `getCover`. `getTripPlaces` throws on a missing place reference, so broken content fails the build once a page uses it.
- Google Drive is an archive, not a production image host (unstable links, rate limits, no CDN or transforms). Export selected web-sized files into `src/assets`; use a real image CDN later if fully external hosting is needed.
- The sample trips, places, and placeholder images are fixtures. Replace them with real content.

## Visual direction

- Reference: https://lightshiprv.com/. Aim for fast, fluid, and editorial, not motion-heavy.
- Avoid scroll-driven animation by default. Use it only in small, local accents; no aggressive pinning, long scrubbed sequences, or full-screen takeovers.
- Approved patterns for the album area (designed in a throwaway mock, **not implemented** in this branch):
  - stacking cards for upcoming trips (CSS `position: sticky` deck);
  - subtle parallax on album cover photos (`animation-timeline: view()` with a static fallback);
  - Astro View Transitions from a map state to its album (`ClientRouter` + shared `transition:name`);
  - soft in-view reveals (opacity + small translate, `IntersectionObserver`, `prefers-reduced-motion` respected).
- Prefer native CSS and browser APIs over GSAP, Swiper, or Swup. Add an animation library only when a specific effect cannot be done cheaply.
- Do not hide content behind JS: progressive enhancement (for example, apply reveal opacity only when a `js` class is present).

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
- The home hero is `min-h-[80vh]`, so the map section starts below the fold on most viewports; it is not visible until the user scrolls.
- Clicking a state currently only highlights it; album navigation is not wired yet.

## Conventions

- Site copy is Spanish; UI text should stay Spanish unless asked otherwise.
- `astro/tsconfigs/strict` is extended. Injected SVG event handlers cast `e.target` as `any` because raw-SVG elements aren't statically typed.
- `public/Venezuela.svg` is the Simplemaps SVG (free for commercial use; attribution appreciated).
