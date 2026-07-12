# Code & Structure Improvement Analysis

Analysis of the sparkler-game-phaser codebase — opportunities for consistency, lifecycle cleanup, and TypeScript tightening.

## Summary

Overall this is a clean, small Phaser project — lint passes, the `@app` alias is sensible, and splitting HUD into `panels/` was a good move. The biggest wins are consistency, lifecycle cleanup, and tightening TypeScript.

---

## File / Folder Structure

**What you have now works.** A light reorganization would mainly help as `game.ts` grows:

```
src/
  scenes/
    gameScene.ts
    hudScene.ts
  panels/          # keep as-is
  game/            # optional: obstacle + particle logic extracted from gameScene
  audio/
    microphone.ts
    stream-processor.ts   # or keep in public/ if it must be a separate worklet URL
  ui/
    layout.ts
    ui.ts
  constants.ts
  types.ts
  main.ts
```

### Concrete structural fixes

1. **Standardize imports** — `hud.ts` mixes `@app/panels/...` with `./constants`. Pick one style (`@app/` everywhere is already set up in Vite/tsconfig).

2. **Convert `microphone.js` to TypeScript** — it's the only JS file in `src/`, types are duplicated/commented out in both files, and `tsc` already complains about missing declarations.

3. **Simplify or strengthen `types.ts`** — `HUDSceneLike = Phaser.Scene` doesn't buy much. Either pass `HUDScene` directly, or define a narrow interface (`add`, `game`, `scale`) if you want panels decoupled from the scene class.

4. **Rename or prune `promisifyThings.ts`** — `promisifyTween` is unused; only `promisifyDelayedCall` is used. Something like `utils/async.ts` would be clearer.

---

## Code Quality (Highest Impact)

### 1. Add a real typecheck step

`npm run lint` passes, but `tsc --noEmit` reports ~15 errors (uninitialized class fields, `unknown` errors, `NodeJS.Timeout` in browser code, untyped `microphone.js`). Turning on `"strict": true` (gradually) and adding:

```json
"typecheck": "tsc --noEmit"
```

would catch these before deploy.

Known `tsc` issues at time of analysis:

- `src/game.ts` — missing declaration for `./microphone.js`; uninitialized class properties; `Object is possibly 'null'`; `error` is of type `unknown`
- `src/layout.ts` — unsafe cast to `Origin`
- `src/main.ts` — `Object is possibly 'null'` on `document.querySelector`
- `src/panels/microphonePanel.ts` — `Cannot find namespace 'NodeJS'`

### 2. Fix inconsistent sizing / resize handling

`game.ts` and `ui.ts` read `window.innerWidth/innerHeight` directly, while `layout.ts` and the panels correctly use `scene.scale`. On resize that can drift. Prefer `this.scale.width` / `this.scale.height` in scenes, and hook resize via `this.scale.on(Phaser.Scale.Events.RESIZE, ...)` instead of raw `window` listeners in `game.ts`.

### 3. Clean up lifecycle / leaks

A few things accumulate over a long session:

- **Window listeners** added in `GameScene.create()` are never removed.
- **Panel event listeners** (`game.events.on`, `scale.on`) are never torn down.
- **Burst particle emitters** in `createBurstParticleEmitter()` are created on every obstacle clear but never destroyed after their lifespan.

A simple `shutdown()` on scenes/panels that calls `.off()` / `removeListener` and destroys one-shot emitters would help.

### 4. Align debug and logging

`main.ts` hardcodes `physics.arcade.debug: true`, while `game.ts` toggles debug via `?debug` in the URL. Pick one approach.

`game.ts` uses `console.log`/`console.error` for microphone events, but `microphone.js` already uses `loglevel`. Using one logger throughout would be cleaner.

### 5. Small correctness / polish items

- **`UPSTRUST`** looks like a typo for `UP_THRUST`.
- **`NodeJS.Timeout`** in `microphonePanel.ts` — use `ReturnType<typeof setTimeout>` in browser code.
- **Error handling** in `onMicrophoneOn` — `error` is `unknown`; narrow it before reading `.message`.
- **Commented-out constants** (`SCROLL_X_SPEED`, `OBSTACLE_WIDTH`) — delete or move to `constants.ts`.
- **`index.html`** — `id=version` should be quoted: `id="version"`.

---

## `game.ts` Decomposition (When You're Ready)

At ~330 lines it's still manageable, but the obvious extractions are:

| Extract to       | What moves                                              |
|------------------|---------------------------------------------------------|
| `obstacles.ts`   | `makeObstaclePair`, collision/clearance logic, gap sizing |
| `particles.ts`   | sparkler + burst emitters                               |
| `gameConfig.ts`  | `UP_THRUST`, gap %, stimulus debounce thresholds        |
| `input.ts`       | tapped/noised/keyboard stimulus handling                |

That would leave `GameScene` as orchestration: state transitions, wiring events, calling helpers.

---

## What's Already in Good Shape

- **`panels/` split** — each panel owns its layout and event handling; good separation from `HUDScene`.
- **`layout.ts`** — reusable anchor system is a nice abstraction.
- **`constants.ts`** — scene keys, asset keys, and event names in one place.
- **Assets in `public/assets/`** — correct for Vite; no duplicate asset folder in git.
- **ESLint + Prettier** — already configured and passing.

---

## Suggested Priority Order

If you want the best ROI with minimal churn:

1. Add `typecheck` script + fix the existing `tsc` errors
2. Unify on `scene.scale` for dimensions and resize
3. Convert `microphone.js` → `microphone.ts`
4. Add `shutdown()` cleanup for listeners and burst emitters
5. Reorganize into `scenes/` when you next touch those files

---

*Generated: July 2026*
