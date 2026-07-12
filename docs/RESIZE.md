# Resize Analysis

How window resizing works in sparkler-game-phaser, what we implemented, and options for further improvements.

---

## What We Implemented (Option 1: `Scale.FIT`)

We switched from `Phaser.Scale.NONE` to **`Scale.FIT`** with the initial window size as the design resolution. Phaser scales the canvas uniformly on resize and letterboxes when the aspect ratio changes.

### `main.ts`

```ts
scale: {
  width: window.innerWidth,    // design resolution = viewport at load time
  height: window.innerHeight,
  mode: Phaser.Scale.FIT,      // uniform scale + letterbox
  autoCenter: Phaser.Scale.CENTER_BOTH,
  expandParent: true,          // Phaser sets parent/body height to 100%
  fullscreenTarget: "game",
},
```

Using the **initial window size** as `width`/`height` means:

- First load looks the same as before (no letterboxing, 1:1 with the viewport)
- On resize, the whole scene (ship, obstacles, HUD, particles) scales together visually
- The game keeps a fixed design coordinate system; Phaser handles display scaling

`backgroundColor: "#000000"` still colours the **canvas** only.

### `game-scene.ts`

- Removed the manual `resize()` handler and `window` resize listeners — with `FIT`, Phaser's Scale Manager handles window resize automatically (do **not** call `scale.resize()` with window dimensions; that was for `NONE` and would change the design resolution)
- Replaced `window.innerWidth/innerHeight` with `this.scale.width/height` so game logic uses the same coordinate system as the HUD

### `index.html` (letterbox centre + colour)

Phaser centres the letterboxed canvas via `marginLeft` / `marginTop` on the canvas. Two CSS fixes were needed:

1. **Centring** — removed `canvas { margin: 0 !important; }` so Phaser's centre margins are not overridden
2. **Letterbox colour** — set `background: #000000` on `html`, `body`, and `#game` to match the canvas (Phaser does not colour the non-canvas areas)

```css
html,
body,
#game {
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  width: 100%;
  height: 100%;
  background: #000000;
}
```

Do **not** add `margin` rules on `canvas` — Phaser owns canvas layout in `FIT` mode.

---

## Current Resize Behaviour

| Layer | Resize behaviour |
|--------|------------------|
| **Scale / canvas** | Good — `FIT` scales uniformly; `CENTER_BOTH` centres letterbox; Phaser listens for window resize |
| **HUD panels** | Good — panels listen to `scale.on(RESIZE)` and re-anchor via `layout.ts` using `scene.scale.width/height` |
| **Game logic (speed, gap %, new obstacles)** | Good — reads `this.scale.width/height` (fixed design coords; values scale visually with canvas) |
| **Ship position** | Scales visually — set once in `create()` at design coords; Y resets on restart |
| **Existing obstacles** | Scales visually — polygon paths baked at design `height`; not rebuilt on resize |
| **Font sizes** | Stale — `typography.ts` still picks size at creation from `window.inner*`; no resize hook (but text scales with `FIT`) |
| **Letterbox bars** | Good — black via page CSS, centred via Phaser |

After a resize, the game **looks** correct because everything scales together. Game state still "thinks" in the design resolution from load time.

---

## Remaining Caveats

### Mid-game resize

Obstacles are polygons built from absolute path coordinates at design height. With `FIT`, they scale visually so collision and visuals stay aligned — no mid-game rebuild needed for correctness. If we later switch away from `FIT` to true 1:1 resizing, obstacle rebuild becomes relevant again.

### `typography.ts`

HUD text font sizes are chosen once at creation from `window.inner*`. With `FIT` the text scales visually on resize, but does not re-pick a font size tier. To unify fully, switch `typography.ts` to `scene.scale.width/height` (or listen for `RESIZE` and call `setFontSize`).

### Design resolution is fixed at load

If the user loads on a phone and later maximises on desktop (or vice versa), letterboxing appears around the original aspect ratio. That is expected `FIT` behaviour. A fixed design size (e.g. 1280×720) would instead letterbox on every viewport that does not match that ratio.

---

## Other Options (Not Implemented)

### 2. Keep `NONE`, unify on `scene.scale` + relayout hook

Replace `window.innerWidth/innerHeight` everywhere with `this.scale.width/height`. On resize, call `scale.resize()` and a `relayoutGame()` that:

- Repositions ship (`x = width * 0.15`, keep or clamp `y`)
- Rebuilds current obstacle pair (preserve scroll/gap/game state, or only when waiting)
- Refreshes HUD text font sizes
- Updates arcade physics world bounds if needed

**Pros:** True 1:1 pixels, no letterboxing.

**Cons:** Mid-game obstacle rebuild is fiddly (world X positions vs scroll).

### 3. Hybrid — scale mode + single dimension source

Use `FIT` (or `RESIZE`) **and** move everything to `scene.scale` so logic and layout agree. We did most of this for the game scene; `typography.ts` is the main remaining piece.

---

## Summary

- **Implemented:** `Scale.FIT` with initial viewport as design size, `scene.scale` in game logic, CSS for letterbox centre and colour.
- **Easiest path (done):** whole scene scales visually with minimal code churn.
- **Further polish:** unify `typography.ts` on `scene.scale`; only needed if we move away from `FIT` or want font tier changes on resize.

---

*Original: July 2026 · Last updated: July 2026*
