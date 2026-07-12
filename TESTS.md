# Test Suggestions

Suggested testing roadmap for sparkler-game-phaser. There is no test runner yet — **Vitest** is a natural fit (same Vite config, ESM-native, good mocking), paired with **jsdom** or **happy-dom** for DOM APIs.

**CI today:** GitHub Actions runs `lint`, `typecheck`, and `build` on every push (see `.github/workflows/ci-cd.yaml`). Tests are not wired in yet.

---

## Highest ROI (pure logic, minimal Phaser)

These give the most value for the least setup. Some helpers are private today; exporting or extracting them (as in the `obstacles.ts` / `gameConfig.ts` split in `IMPROVEMENTS.md`) would make testing much easier.

### Layout (`layout.ts`)

- **`parseEdgeOffset`** — `"left+20"` → `20`, `"right-20"` on width 800 → `780`, unknown string → `0`
- **`applyAnchor`** — with a mocked scene (`scale.width/height`) and a fake game object with `setOrigin` / `setPosition`, verify each anchor combo (`left+20`, `centerX`, `bottom-20`, etc.)
- **`layoutVertical`** — given children with known `displayWidth` / `displayHeight`, assert vertical stacking, centering, and returned total height

### UI sizing (`ui.ts`)

- **Font size breakpoint** — at max dimension ≤ 640 → big 24 / small 8; above → 48 / 16  
  (Would need extracting `getFontSizeBig` / `getFontSizeSmall` or passing dimensions in. Font size is still set only at creation — no resize refresh yet; see [RESIZE.md](RESIZE.md).)

### Game tuning (`game.ts`)

Worth extracting first, then testing:

- **`getSpeed`** — `Math.round(max(w, h) / 200)` for a few viewport sizes
- **`getObstacleWidth`** — `Math.round(max(w, h) / 20)`
- **`getScrollDistance(delta)`** — `getSpeed() * (delta / REFERENCE_FRAME_MS)` with clamped delta
- **Gap difficulty** — starts at 30%, decreases by 2 per cleared obstacle, floors at 10%
- **Stimulus debounce** — tap/noise flags stay active for `STIMULUS_FRAME_COUNT * REFERENCE_FRAME_MS` (~83ms at 60fps), then reset; timer only starts on first activation
- **Keyboard flap** — `JustDown` on up arrow calls `triggerFlap()` (same burst as tap, not continuous thrust)
- **Obstacle cleared detection** — `shipX >= obstacleRight` sets `obstaclePairCleared` once per pair; emits `ObstacleCleared` + burst at `(ship.x, ship.y)`
- **Collision** — ship inside obstacle polygon → `GameEnded`; outside → no event

### Particles (`createBurstParticleEmitter`)

Regression test for Phaser 4 API: emitter created at `(x, y)` must call `explode(count)` **without** repeating `x, y` — passing coords to both `add.particles` and `explode` doubles the offset.

---

## Good unit tests with mocks

### Microphone (`microphone.ts`)

Mock `navigator.mediaDevices.getUserMedia`, `AudioContext`, and `audioWorklet.addModule`:

- **`microphoneOn`** — success path wires stream + worklet; missing `getUserMedia` throws a clear error
- **`microphoneOn` failure** — permission denied rethrows; error is logged
- **`microphoneOff`** — stops tracks, closes context, idempotent when already off
- **Threshold callback** — simulate worklet `port.onmessage` with sample data above/below `NOISE_LEVEL_THRESHOLD`; callback only fires when mic is on and value ≥ threshold

### Panels (Phaser scene stubs)

Lightweight mocks for `scene.add`, `scene.game.events`, `scene.scale`:

| Panel | Suggested tests |
|-------|-----------------|
| **ScorePanel** | `GameStarted` → score 0; each `ObstacleCleared` → +1; text updates |
| **GameOverPanel** | hidden on `GameStarted`, visible on `GameEnded` |
| **MicrophonePanel** | click toggles mute line + emits `MicrophoneOn`/`MicrophoneOff`; `GameEnded` schedules auto-mute after 10s; `GameStarted` cancels pending auto-mute; `MicrophoneError` hides icon and shows error UI |
| **VersionPanel** | shows `v{package.json version}`; re-anchors bottom-left on `RESIZE` |

### Async helpers (`promisifyThings.ts`)

- **`promisifyDelayedCall`** — mock `scene.time.delayedCall`, assert it resolves after the delay fires
- **`promisifyTween`** — mock tween + `once(TWEEN_COMPLETE)` (currently unused, lower priority)

---

## Integration / scene-level

Heavier, but catches wiring bugs:

- **Game state machine** — boot `GameScene` in a headless/minimal Phaser game; simulate tap → `GameStarted`; simulate collision → `GameEnded`
- **Event bus** — full flow: tap → score resets → obstacle cleared → score increments + burst → collision → game over panel shows
- **Resize** — `scale.resize` called when window resizes; panels re-layout; game relayout still incomplete — see [RESIZE.md](RESIZE.md)

Libraries like `@phaserjs/test-utils` or a minimal custom Phaser headless bootstrap can help; expect more setup cost than unit tests.

---

## Audio worklet (`public/stream-processor.js`)

Small and isolated:

- **`process`** — given mock `inputs[0][0]`, posts that buffer via `port.postMessage` and returns `true`
- **Registration** — `registerProcessor("stream-processor", …)` is called (if test env supports worklet globals)

---

## Smoke / CI

Partially in place today:

| Check | Status |
|-------|--------|
| `npm run lint` | CI on push |
| `npm run typecheck` | CI on push |
| `npm run build` | CI on push |
| `npm test` | Not yet — add Vitest when ready |

Suggested addition to `package.json`:

```json
"test": "vitest run",
"test:ci": "npm run typecheck && npm run lint && npm run test && npm run build"
```

Optional extras:

- **Import graph** — `main.ts` loads without throwing (smoke import test)

---

## Suggested priority

1. **Vitest + `npm test`** — wire the runner; fold into CI after first tests land
2. **Extract + test game math** — speed, obstacle width, scroll distance, gap shrink, clearance flag
3. **Layout tests** — anchor parsing and positioning (used by every panel)
4. **Microphone tests** — mocked browser APIs; high bug risk around permissions
5. **Panel event tests** — score, game over, mute/auto-mute, version
6. **Headless Phaser integration** — only if you want end-to-end confidence

---

## What to skip (for now)

- **`constants.ts`** — no behavior to test
- **Visual/particle appearance** — brittle, low signal (except burst position regression noted above)
- **Full browser E2E (Playwright)** — nice later for “tap to start” on real devices, but overkill until unit coverage exists

---

## Best first slice

**Layout + extracted game math** — mostly pure functions, no Web Audio, and they protect UI positioning and core gameplay feel.

---

*Original: July 2026 · Last updated: July 2026*
