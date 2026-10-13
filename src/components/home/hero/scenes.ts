import type { gsap } from 'gsap'
import { grid, type Screen } from './ascii'

/* ------------------------------------------------------------------ *
 * The home hero as data: a short intro played once on load, ending on
 * a calm scene that loops forever. Each scene is a resting frame
 * (`art`, which also fixes its size), how it enters and exits, an
 * optional `play` for the animated middle, and how long it holds.
 * HeroAnimation.vue owns the timeline and turns these into tweens.
 * ------------------------------------------------------------------ */

export type EnterKind = 'slide' | 'rise' | 'fade'
export type ExitKind = 'slide-right' | 'dissolve'

export interface SceneCtx {
  tl: gsap.core.Timeline
  /** Write a screen to the stage (padded to the scene's size). */
  show(s: Screen): void
  /** Tween p 0→1 over `duration` seconds, showing render(p) every tick. */
  text(duration: number, render: (p: number) => Screen, ease?: string): void
  /** Show render(t) forever, t = seconds since the loop started, stepped at `fps`. */
  loop(fps: number, render: (t: number) => Screen): void
}

export interface Scene {
  id: string
  art: Screen
  caption: string
  enter: EnterKind
  /** Omitted on the last scene, which never leaves. */
  exit?: ExitKind
  /** Seconds to rest on the final frame before exiting. */
  hold: number
  play?: (ctx: SceneCtx) => void
}

/* ---------- 1 + 2: the original NAVI and COFFEE art, unchanged ---------- */

// prettier-ignore
export const logoArt = [
  '███╗   ██╗ █████╗ ██╗   ██╗██╗',
  '████╗  ██║██╔══██╗██║   ██║██║',
  '██╔██╗ ██║███████║██║   ██║██║',
  '██║╚██╗██║██╔══██║╚██╗ ██╔╝██║',
  '██║ ╚████║██║  ██║ ╚████╔╝ ██║',
  '╚═╝  ╚═══╝╚═╝  ╚═╝  ╚═══╝  ╚═╝',
]

// prettier-ignore
const coffeeArt = [
  '███████╗███████╗███████╗███████╗███████╗███████╗',
  '██╔════╝██╔══██╗██╔════╝██╔════╝██╔════╝██╔════╝',
  '██║     ██║  ██║███████╗███████╗███████╗███████╗',
  '██║     ██║  ██║██╔════╝██╔════╝██╔════╝██╔════╝',
  '███████╗███████║██║     ██║     ███████╗███████╗',
  ' ╚═════╝ ╚═════╝╚═╝     ╚═╝      ╚═════╝ ╚═════╝',
]

/* ---------- 4: steaming cup (loops forever) ---------- */

const CUP_W = 30
function steamCup(t: number): Screen {
  const g = grid(CUP_W, 12)
  // three wisps that sway and curl, thinning out towards the top
  const plumes = [9, 14, 19]
  plumes.forEach((base, k) => {
    const height = 2 + Math.round(1 + Math.sin(t * 0.9 + k * 1.7))
    for (let r = 0; r < 4; r++) {
      const fromCup = 3 - r // 0 = just above the cup
      if (fromCup >= height) continue
      const phase = t * 1.8 + fromCup * 1.15 + k * 2.1
      const x = base + Math.round(Math.sin(phase) * 1.4)
      const ch = fromCup >= height - 1 ? (Math.cos(phase) > 0 ? '˙' : '.') : Math.cos(phase) > 0 ? ')' : '('
      g.set(x, r, ch)
    }
  })
  g.text(3, 4, '▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄')
  g.text(3, 5, '█▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓█▀▀▀▄')
  g.text(3, 6, '█                  █   █')
  g.text(3, 7, '█       NAVI       █   █')
  g.text(3, 8, '█                  █▄▄▄▀')
  g.text(4, 9, '▀▄              ▄▀')
  g.text(6, 10, '▀▀▀▀▀▀▀▀▀▀▀▀▀▀')
  g.text(0, 11, '▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀')
  return g.lines()
}

/* ---------- 3: ORDER ▸ SCAN ▸ SIP ---------- */

const STEPS = ['ORDER', 'SCAN', 'SIP']
function progress(p: number): Screen {
  const g = grid(34, 4)
  const pct = Math.round(Math.min(1, p) * 100)
  const step = Math.min(2, Math.floor(Math.min(0.999, p) * 3))
  STEPS.forEach((label, i) => {
    const x = 1 + i * 13
    g.text(x, 0, label)
    const mark = i < step || p >= 1 ? '[■]' : i === step ? '[▸]' : '[ ]'
    g.text(x, 1, mark)
    if (i < 2) g.text(x + 4, 1, (i < step ? '━' : '─').repeat(8))
  })
  const bar = 26
  const filled = Math.round((pct / 100) * bar)
  g.text(1, 3, `[${'█'.repeat(filled)}${'░'.repeat(bar - filled)}] ${String(pct).padStart(3)}%`)
  return g.lines()
}

/* ---------- the sequence ---------- */

export const scenes: Scene[] = [
  { id: 'logo', art: logoArt, caption: '', enter: 'slide', exit: 'slide-right', hold: 3 },
  {
    id: 'coffee',
    art: coffeeArt,
    caption: 'coffee, your way',
    enter: 'rise',
    exit: 'slide-right',
    hold: 3,
  },
  {
    id: 'progress',
    art: progress(0),
    caption: '',
    enter: 'fade',
    exit: 'dissolve',
    hold: 2,
    play: (ctx) => ctx.text(6, (p) => progress(Math.round(p * 26) / 26), 'sine.inOut'),
  },
  {
    id: 'steam',
    art: steamCup(0),
    caption: 'coffee, your way',
    enter: 'fade',
    hold: 0,
    // slow drift: a quarter of the original sway speed, stepped at 4fps
    play: (ctx) => ctx.loop(4, (t) => steamCup(t * 0.45)),
  },
]
