# Code & Structure Improvement Analysis

Analysis of the sparkler-game-phaser codebase — opportunities for consistency, lifecycle cleanup, and TypeScript tightening.

## Summary

Overall this is a clean, small Phaser project — lint and typecheck pass, the `@app` alias is sensible, and splitting HUD into `panels/` was a good move. Several items from the original analysis are now done (see below). The biggest remaining wins are resize consistency, lifecycle cleanup, and optional `game.ts` decomposition.

---

## Completed Since Original Analysis

| Item | What changed |
|------|----------------|
| **Typecheck** | `npm run typecheck` added; existing `tsc` errors fixed |
| **`microphone.js` → `microphone.ts`** | Typed module; `src/microphone.d.ts` removed; `src/vite-env.d.ts` added for `import.meta.env` |
| **`types.ts`** | Removed — panels take `Phaser.Scene` directly |
| **Browser timer typing** | `NodeJS.Timeout` → `ReturnType<typeof setTimeout> \| null` in `microphonePanel.ts` |
| **Error narrowing** | `unknown` errors narrowed in `game.ts` and `microphone.ts` |
| **DOM version label** | Replaced `#version` span in `index.html` with `VersionPanel` (Phaser HUD, bottom-left) |
| **Delta-aware game loop** | Scroll, tap/noise debounce (ms-based), and clearance detection scaled by `_delta` |
| **Keyboard input** | Up arrow uses same flap burst as tap (`JustDown` + `triggerFlap`), not continuous thrust |
| **Burst effect** | Clearance uses `shipX >= obstacleRight` + `obstaclePairCleared`; Phaser 4 `explode()` position fix (no double offset) |
| **CI/CD** | GitHub Actions: lint, typecheck, build on push; gh-pages deploy on tag; Dependabot for npm + actions |
| **Dead constants** | Commented-out `SCROLL_X_SPEED` / `OBSTACLE_WIDTH` removed from `game.ts` |

---

## File / Folder Structure

**What you have now works.** A light reorganization would mainly help as `game.ts` grows:

```
src/
  scenes/
    gameScene.ts
    hudScene.ts
  panels/          # keep as-is (now includes versionPanel.ts)
  game/            # optional: obstacle + particle logic extracted from gameScene
  audio/
    microphone.ts
    stream-processor.ts   # or keep in public/ if it must be a separate worklet URL
  ui/
    layout.ts
    ui.ts
  constants.ts
  main.ts
```

### Concrete structural fixes

1. **Standardize imports** — `hud.ts` mixes `@app/panels/...` with `./constants`. Pick one style (`@app/` everywhere is already set up in Vite/tsconfig).

2. ~~**Convert `microphone.js` to TypeScript**~~ — **Done** (`src/microphone.ts`).

3. ~~**Simplify or strengthen `types.ts`**~~ — **Done** (file removed).

4. **Rename or prune `promisifyThings.ts`** — `promisifyTween` is unused; only `promisifyDelayedCall` is used. Something like `utils/async.ts` would be clearer.

5. ~~**Remove orphan `src/components/`**~~ — **Done** (moved to `src/panels/` in commit `5f15c2a`; `hud.ts` imports from `@app/panels/...`).

---

## Code Quality (Highest Impact)

### 1. ~~Add a real typecheck step~~ — **Done**

`npm run typecheck` runs in CI. Optional next step: enable `"strict": true` gradually in `tsconfig.json`.

### 2. Fix inconsistent sizing / resize handling — **Open**

`game.ts` and `ui.ts` still read `window.innerWidth/innerHeight` directly, while `layout.ts` and the panels correctly use `scene.scale`. On resize the HUD re-anchors but ship position, existing obstacles, and font sizes can drift.

See **[RESIZE.md](RESIZE.md)** for a full analysis. Quick options:

- **Easiest:** `Phaser.Scale.FIT` with a fixed design resolution
- **Proper:** unify on `scene.scale` + `relayoutGame()` on resize (rebuild obstacles when waiting, or mid-game with care)

Also prefer `this.scale.on(Phaser.Scale.Events.RESIZE, ...)` over raw `window` listeners in `game.ts` (panels already use the Phaser event).

### 3. Clean up lifecycle / leaks — **Open**

A few things accumulate over a long session:

- **Window listeners** added in `GameScene.create()` are never removed.
- **Panel event listeners** (`game.events.on`, `scale.on`) are never torn down.
- **Burst particle emitters** in `createBurstParticleEmitter()` are created on every obstacle clear but never destroyed after their lifespan.

A simple `shutdown()` on scenes/panels that calls `.off()` / `removeListener` and destroys one-shot emitters would help.

### 4. Align debug and logging — **Open**

`main.ts` hardcodes `physics.arcade.debug: true`, while `game.ts` toggles debug via `?debug` in the URL. Pick one approach.

`game.ts` uses `console.log`/`console.error` for microphone events, but `microphone.ts` already uses `loglevel`. Using one logger throughout would be cleaner.

### 5. Small correctness / polish items

- ~~**`UPSTRUST`** typo~~ — **Done** (renamed to `UP_THRUST`).
- ~~**`NodeJS.Timeout`** in `microphonePanel.ts`~~ — **Done**.
- ~~**Error handling** in `onMicrophoneOn`~~ — **Done**.
- ~~**Commented-out constants**~~ — **Done**.
- ~~**`index.html` `id=version`**~~ — **Done** (DOM label removed; `VersionPanel` instead).

---

## `game.ts` Decomposition (When You're Ready)

At ~350 lines it's still manageable, but the obvious extractions are:

| Extract to       | What moves                                              |
|------------------|---------------------------------------------------------|
| `obstacles.ts`   | `makeObstaclePair`, collision/clearance logic, gap sizing |
| `particles.ts`   | sparkler + burst emitters                               |
| `gameConfig.ts`  | `UP_THRUST`, gap %, stimulus duration thresholds        |
| `input.ts`       | `triggerFlap`, tapped/noised/keyboard stimulus handling |

That would leave `GameScene` as orchestration: state transitions, wiring events, calling helpers.

---

## What's Already in Good Shape

- **`panels/` split** — each panel owns its layout and event handling; good separation from `HUDScene`.
- **`layout.ts`** — reusable anchor system is a nice abstraction.
- **`constants.ts`** — scene keys, asset keys, and event names in one place.
- **Assets in `public/assets/`** — correct for Vite; no duplicate asset folder in git.
- **ESLint + Prettier + typecheck** — configured, passing, and run in CI.
- **CI/CD** — `.github/workflows/ci-cd.yaml` + Dependabot.

---

## Suggested Priority Order

If you want the best ROI with minimal churn:

1. ~~Add `typecheck` script + fix the existing `tsc` errors~~ — **Done**
2. ~~Convert `microphone.js` → `microphone.ts`~~ — **Done**
3. Unify on `scene.scale` for dimensions and resize — see [RESIZE.md](RESIZE.md)
4. Add `shutdown()` cleanup for listeners and burst emitters
5. Standardize `@app/` imports in `hud.ts` and elsewhere
6. Reorganize into `scenes/` when you next touch those files

---

*Original: July 2026 · Last updated: July 2026*
