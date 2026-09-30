# @sanchez/web

The Sanchez Custom Boxing site: Next.js (App Router, Turbopack), strict TypeScript, React 19.

The **home page is a faithful port of the HTML prototype** (`prototype/index.html`, still the visual source of truth). Read `docs/HOME-PAGE-SPEC.md` for what every block does and every tunable.

## Run

```bash
cd apps/web
npm run dev          # http://localhost:3000
npm run build && npm run start
npm run typecheck && npx eslint src
npx vitest run --root ../.. --config ../../vitest.config.ts
```

## Layout

| Path | What |
|---|---|
| `src/app/page.tsx` | Home: hero, curved loop, workshop gallery, marquee, 3D bag, feature cards, rise panel (footer + waitlist) |
| `src/app/api/waitlist/route.ts` | Waitlist endpoint: Zod validation, honeypot, per-client rate limit, provider adapter |
| `src/lib/hero/` | Hero field engine (framework-free, testable): `engine.ts`, `config.ts` (every tunable), `flag.ts`, `waves.ts`, `noise.ts` |
| `src/lib/bag/` | 3D bag engine (three.js + anime.js), products, art |
| `src/lib/{curved-loop,dna,footer-globe,stitch-overlay,depth-card,rise}.ts` | The other engines, each a class or pure function with `destroy()` |
| `src/components/home/` | Thin React wrappers that own only lifecycle (mount, destroy) |
| `src/styles/` | `base.css` (design tokens) and `home.css`, carried over verbatim from the prototype |
| `public/assets/` | Images, GLB models, flag artwork (`flag/flag-3840.png`), globe textures, vendored gallery bundle |

## Notes

- The workshop gallery is the MIT "Liquid Glass Carousel" (componentry.dev) as a vendored, patched build (`public/assets/carousel/lgc.bundle.js`); its scroll, ruler and note behaviours are typed modules in `components/home/gallery-behaviours.ts`.
- Waitlist storage is a stub (`lib/waitlist-store.ts`): business TODO #22 (provider, double opt-in, consent wording).
- Reduced motion: no spray, waves, flow, orbit or drift; the rise panel becomes a plain block.
- Evidence rule (from the master brief): no invented claims, prices, specs or client names. Placeholders are marked.
