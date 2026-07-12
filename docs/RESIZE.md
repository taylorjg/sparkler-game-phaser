# Resize Analysis

How window resizing works in sparkler-game-phaser today, and options for making the game fit or scale cleanly after a resize.

---

## What Happens Today

**On resize, only one thing runs in the game scene:**

```ts
private resize(): void {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  this.scale.resize(windowWidth, windowHeight);
}
```

That updates the canvas size and fires Phaser's `RESIZE` event.

| Layer | Resize behaviour |
|--------|------------------|
| **HUD panels** | Good — score, mic, game over, version all listen to `scale.on(RESIZE)` and re-anchor via `layout.ts` using `scene.scale.width/height` |
| **Game logic (speed, gap %, new obstacles)** | Partially good — `getSpeed()`, `getObstacleWidth()`, etc. read `window.innerWidth/innerHeight` each frame |
| **Ship position** | Stale — set once in `create()` at `width * 0.15`; only Y resets on restart |
| **Existing obstacles** | Stale — polygon paths baked at old `windowHeight`; not rebuilt on resize |
| **Font sizes** | Stale — `ui.ts` picks size at creation from `window.inner*`; no resize hook |
| **Scale mode** | `Phaser.Scale.NONE` — 1 canvas pixel = 1 game pixel, no automatic fit/letterbox |

So after a resize: HUD moves to the corners, but the ship, obstacles, and text sizes can drift relative to the new window.

There's also a split source of truth: HUD uses `scene.scale`, game uses `window.inner*` (see also `IMPROVEMENTS.md`).

---

## Easy Options (Least Code First)

### 1. Phaser scale mode — “make it fit” with minimal changes

Switch from `NONE` to a scale mode that handles the canvas for you:

```ts
scale: {
  width: 1920,           // design resolution
  height: 1080,
  mode: Phaser.Scale.FIT,      // uniform scale + letterbox
  autoCenter: Phaser.Scale.CENTER_BOTH,
}
```

- **FIT** — scales uniformly, letterboxes; layout stays proportional
- **ENVELOP** — fills the window, may crop
- **RESIZE** — stretches to fill (can distort)

**Pros:** One config change; everything (ship, obstacles, HUD, particles) scales together visually.

**Cons:** Mid-game state still “thinks” in design coords unless you pick one coordinate system; very wide/tall windows add letterboxing.

This is the easiest “everything scales to fit” approach if you're OK with a fixed design aspect ratio.

### 2. Keep `NONE`, unify on `scene.scale` + relayout hook

Replace `window.innerWidth/innerHeight` in `game.ts` and `ui.ts` with `this.scale.width/height` (or pass dimensions in).

On resize, do more than `scale.resize()`:

```ts
private resize(): void {
  this.scale.resize(window.innerWidth, window.innerHeight);
  this.relayoutGame();
}
```

`relayoutGame()` would need to:

- Reposition ship (`x = width * 0.15`, keep or clamp `y`)
- Rebuild current obstacle pair (preserve scroll/gap/game state, or only allow when waiting)
- Refresh HUD text font sizes (recreate or `setFontSize`)
- Update arcade physics world bounds if needed

**Pros:** True 1:1 pixels, no letterboxing; HUD pattern already exists.

**Cons:** Mid-game obstacle rebuild is the fiddly part (world X positions vs scroll).

### 3. Hybrid — scale mode + single dimension source

Use `FIT` (or `RESIZE`) **and** move everything to `scene.scale` so logic and layout agree. Best long-term, slightly more refactor upfront.

---

## Recommendation for This Project

- **Quickest win:** `Scale.FIT` with a design size (e.g. 1280×720 or current typical viewport). Playable on any screen with minimal code churn.
- **Cleanest long-term:** `Scale.NONE` + `scene.scale` everywhere + a `relayoutGame()` on resize (and optionally only rebuild obstacles when `gameState === Waiting` to avoid mid-run glitches).

---

## Mid-Game Resize Caveat

Obstacles are polygons built from absolute path coordinates at a fixed height. Resizing mid-run without rebuilding them will misalign collision vs visuals. Options:

1. **Only fully relayout when waiting** (game over / pre-start)
2. **Rebuild obstacles on resize** using current `scrollX`, `gapPercent`, and new dimensions
3. **Ignore mid-game resize** and only handle orientation/size at start (simplest, worse UX)

---

## Summary

There isn't one call that fixes everything today because game objects are positioned at creation time while only the HUD re-anchors on resize. The **easiest** path is Phaser **`Scale.FIT`** so the whole scene scales. The **proper** path is unify on `scene.scale` and add a game relayout (like the panels already have).

---

*Generated: July 2026*
