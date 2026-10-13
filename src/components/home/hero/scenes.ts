import type { gsap } from 'gsap'
import { decode, grid, pad, ranks, rng, size, typewriter, type Screen } from './ascii'

/* ------------------------------------------------------------------ *
 * Hero scenes as data. Each scene is a resting frame (`art`, which
 * also fixes its size), how it enters and exits, an optional `play`
 * for the animated middle, and how long it holds before leaving.
 * HeroAnimation.vue owns the timeline and turns these into tweens.
 * ------------------------------------------------------------------ */

export type EnterKind = 'slide' | 'rise' | 'crt' | 'decode' | 'dissolve' | 'blank'
export type ExitKind = 'slide-right' | 'dissolve' | 'crt' | 'scramble'

export interface SceneCtx {
  tl: gsap.core.Timeline
  /** Write a screen to the stage (padded to the scene's size). */
  show(s: Screen): void
  /** Tween p 0→1 over `duration` seconds, showing render(p) every tick. */
  text(duration: number, render: (p: number) => Screen, position?: gsap.Position): void
  /** Step through `count` frames at `fps`. */
  frames(count: number, fps: number, render: (i: number) => Screen, position?: gsap.Position): void
  /** Full-width scan-line overlay on the art (hidden by default). */
  scan: HTMLElement
  art: HTMLElement
}

export interface Scene {
  id: string
  /** One-liner for docs / the report. */
  description: string
  art: Screen
  caption: string
  captionIn?: 'fade' | 'decode'
  enter: EnterKind
  exit: ExitKind
  /** Seconds to rest on the final frame before exiting. */
  hold: number
  play?: (ctx: SceneCtx) => void
}

/* ---------- 1 + 2: the originals, unchanged ---------- */

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

/* ---------- 3: steaming cup ---------- */

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

/* ---------- 4: espresso pour ---------- */

const POUR_W = 32
const CUP_TOP = 6
const CUP_ROWS = 4
function espresso(p: number): Screen {
  const g = grid(POUR_W, 11)
  const led = p < 0.9 && Math.floor(p * 12) % 2 === 0 ? '●' : '○'
  g.text(2, 0, '┌──────────────────────────┐')
  g.text(2, 1, `│ ${led} NAVI    ■ ■ ■   [||||] │`)
  g.text(2, 2, '└──────────┬────┬──────────┘')
  g.text(13, 3, '└┐  ┌┘')
  // cup
  for (let r = 0; r < CUP_ROWS; r++) {
    g.set(8, CUP_TOP + r, '█')
    g.set(23, CUP_TOP + r, '█')
  }
  g.text(24, CUP_TOP + 1, '▀▀▄')
  g.set(26, CUP_TOP + 2, '█')
  g.text(24, CUP_TOP + 3, '▄▄▀')
  g.text(9, CUP_TOP + CUP_ROWS, '▀▄▄▄▄▄▄▄▄▄▄▄▄▀')

  // fill level in half-rows: 0 … CUP_ROWS*2
  const fill = Math.round(Math.min(1, Math.max(0, (p - 0.12) / 0.7)) * CUP_ROWS * 2)
  for (let h = 0; h < fill; h++) {
    const row = CUP_TOP + CUP_ROWS - 1 - Math.floor(h / 2)
    const top = h === fill - 1
    const done = fill === CUP_ROWS * 2
    const ch = h % 2 === 0 ? (top ? '▄' : '█') : '█'
    for (let x = 9; x < 23; x++) g.set(x, row, done && top ? '░' : ch === '█' ? '▓' : '▄')
  }

  // the stream: grows down, then retracts from the top once the cup is full
  const surface = CUP_TOP + CUP_ROWS - 1 - Math.floor(fill / 2)
  const head = Math.min(surface, 4 + Math.floor(p / 0.12 * (surface - 3)))
  const tail = p < 0.82 ? 4 : 4 + Math.floor(((p - 0.82) / 0.14) * (surface - 3))
  for (let y = tail; y <= head && y >= 4; y++) {
    if (y < CUP_TOP + CUP_ROWS - Math.ceil(fill / 2) || y < CUP_TOP) g.text(15, y, '▐▌')
  }
  return g.lines()
}

/* ---------- 5: NaviPort machine ---------- */

function naviport(p: number): Screen {
  const g = grid(30, 11)
  const boot = '> BOOT ........ ok'
  const ready = '> READY'
  const typed = Math.max(0, Math.floor(((p - 0.05) / 0.5) * (boot.length + ready.length)))
  const l1 = boot.slice(0, typed)
  const l2 = typed > boot.length ? ready.slice(0, typed - boot.length) : ''
  const cursorOn = Math.floor(p * 10) % 2 === 0
  const led = p > 0.6 ? (Math.floor(p * 8) % 2 === 0 ? '●' : '○') : '○'

  g.text(2, 0, '╔════════════════════════╗')
  g.text(2, 1, '║ ┌────────────────────┐ ║')
  g.text(2, 2, '║ │                    │ ║')
  g.text(2, 3, '║ │                    │ ║')
  g.text(2, 4, '║ └────────────────────┘ ║')
  g.text(2, 5, `║  ${led}  N A V I P O R T    ║`)
  g.text(2, 6, '║  ┌──────────────────┐  ║')
  g.text(2, 7, '║  │  ▄▄▄   ▄▄▄   ▄▄▄ │  ║')
  g.text(2, 8, '║  └──────────────────┘  ║')
  g.text(2, 9, '╚══╤══════════════════╤══╝')
  g.text(5, 10, '▀                  ▀')
  g.text(6, 2, l1)
  g.text(6, 3, l2)
  if (cursorOn) {
    const onFirst = typed <= boot.length
    g.set(6 + (onFirst ? l1.length : l2.length + 1), onFirst ? 2 : 3, '█')
  }
  return g.lines()
}

/* ---------- 6: QR assemble + scan ---------- */

const QR = 21
const qrMatrix: boolean[][] = (() => {
  const r = rng(7)
  const m = Array.from({ length: QR }, () => Array.from({ length: QR }, () => r() < 0.48))
  const finder = (ox: number, oy: number) => {
    for (let y = -1; y <= 7; y++)
      for (let x = -1; x <= 7; x++) {
        const X = ox + x
        const Y = oy + y
        if (X < 0 || Y < 0 || X >= QR || Y >= QR) continue
        const ring = Math.max(Math.abs(x - 3), Math.abs(y - 3))
        m[Y]![X] = ring !== 2 && ring !== 4
      }
  }
  finder(0, 0)
  finder(QR - 7, 0)
  finder(0, QR - 7)
  for (let i = 8; i < QR - 8; i++) {
    m[6]![i] = i % 2 === 0
    m[i]![6] = i % 2 === 0
  }
  return m
})()
const isFinder = (x: number, y: number) =>
  (x < 8 && y < 8) || (x >= QR - 8 && y < 8) || (x < 8 && y >= QR - 8)
const qrRank = (() => {
  const r = rng(11)
  return qrMatrix.map((row, y) => row.map((_, x) => (isFinder(x, y) ? r() * 0.18 : 0.18 + r() * 0.82)))
})()

const QR_W = QR + 6
function qr(p: number): Screen {
  const rows = Math.ceil(QR / 2)
  const g = grid(QR_W, rows + 2)
  const on = (x: number, y: number) => y < QR && qrMatrix[y]![x]! && qrRank[y]![x]! < p
  for (let row = 0; row < rows; row++) {
    for (let x = 0; x < QR; x++) {
      const top = on(x, row * 2)
      const bottom = on(x, row * 2 + 1)
      g.set(x + 3, row + 1, top && bottom ? '█' : top ? '▀' : bottom ? '▄' : ' ')
    }
  }
  // viewfinder corners
  g.text(0, 0, '┌─')
  g.text(QR_W - 2, 0, '─┐')
  g.text(0, rows + 1, '└─')
  g.text(QR_W - 2, rows + 1, '─┘')
  return g.lines()
}

/* ---------- 7: latte-art heart ---------- */

const LAT_W = 26
const LAT_H = 13
// prettier-ignore
const HEART = [
  ' ▄███▄▄███▄ ',
  '████████████',
  ' ██████████ ',
  '  ▀██████▀  ',
  '    ▀██▀    ',
]
const HEART_X = 6
const HEART_Y = 4
const latteCells = (() => {
  const cx = 11.5
  const cy = 6
  const rx = 10.5
  const ry = 6
  const cells: { x: number; y: number; ch: string; rank: number }[] = []
  for (let y = 0; y < LAT_H; y++) {
    for (let x = 0; x < LAT_W; x++) {
      const u = (x - cx) / rx
      const v = (y - cy) / ry
      const d = u * u + v * v
      const heart = HEART[y - HEART_Y]?.[x - HEART_X]
      if (d > 1.12) {
        if (x >= 23 && x <= 25 && y >= 5 && y <= 7) cells.push({ x, y, ch: y === 6 ? '█' : '▓', rank: -1 })
      } else if (d > 0.78) {
        cells.push({ x, y, ch: '█', rank: -1 })
      } else if (heart && heart !== ' ') {
        // poured from the dip outwards round both lobes, finishing at the tip
        const rank = Math.atan2(Math.abs(x - cx) * 0.6, HEART_Y + 0.5 - y) / Math.PI
        cells.push({ x, y, ch: heart, rank })
      } else {
        cells.push({ x, y, ch: '░', rank: -1 })
      }
    }
  }
  return cells
})()

function latte(p: number): Screen {
  const g = grid(LAT_W, LAT_H)
  for (const c of latteCells) g.set(c.x, c.y, c.rank < 0 || c.rank <= p * 1.02 ? c.ch : '░')
  return g.lines()
}

/* ---------- 8: spinning bean ---------- */

const BEAN_W = 30
const BEAN_H = 12
const SHADES = ' ░▒▓█'
function bean(theta: number): Screen {
  const g = grid(BEAN_W, BEAN_H)
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  const A = 7.2 // half-width in em
  const B = 4.9 // half-height in em
  const a = A * Math.sqrt(c * c + 0.36 * s * s)
  const tilt = -0.35
  const ct = Math.cos(tilt)
  const st = Math.sin(tilt)
  for (let y = 0; y < BEAN_H; y++) {
    for (let x = 0; x < BEAN_W; x++) {
      // chars are 0.6em wide and 1em tall
      const dx = (x - (BEAN_W - 1) / 2) * 0.6
      const dy = y - (BEAN_H - 1) / 2
      const X = dx * ct - dy * st
      const Y = dx * st + dy * ct
      const nx = X / a
      const ny = Y / B
      const r2 = nx * nx + ny * ny
      if (r2 > 1) continue
      // front face carries the S-shaped crease
      const crease = 0.2 * Math.sin(ny * Math.PI) * c * A
      if (c > 0.15 && Math.abs(X - crease) < 0.45 && Math.abs(ny) < 0.86) {
        g.set(x, y, ' ')
        continue
      }
      const light = Math.sqrt(1 - r2) * 0.75 + (-nx * 0.25 - ny * 0.35) + 0.15
      const i = Math.max(1, Math.min(4, Math.round(light * 4)))
      g.set(x, y, SHADES[i]!)
    }
  }
  return g.lines()
}

/* ---------- 9: terminal tagline ---------- */

// prettier-ignore
const terminal = [
  'navi@port:~$ brew --your-way',
  '',
  '  [ok] grind ............ fine',
  '  [ok] milk ............. oat',
  '  [ok] shots ............ x2',
  '  [ok] temp ............. 68°C',
  '',
  '  > coffee, your way',
]

/* ---------- 10: ORDER ▸ SCAN ▸ SIP ---------- */

const STEPS = ['ORDER', 'SCAN', 'SIP']
const STATUS = ['> placing your order...', '> show your QR to the NaviPort', '> enjoy. see you tomorrow.']
function progress(p: number): Screen {
  const g = grid(34, 7)
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
  g.text(1, 5, STATUS[p >= 1 ? 2 : step]!)
  return g.lines()
}

/* ---------- the reel ---------- */

export const scenes: Scene[] = [
  {
    id: 'logo',
    description: 'NAVI block logo; lines slide in from the left, tagline fades in, slides out right.',
    art: logoArt,
    caption: 'coffee, your way',
    captionIn: 'fade',
    enter: 'slide',
    exit: 'slide-right',
    hold: 1.5,
  },
  {
    id: 'coffee',
    description: 'COFFEE block letters rising line by line, then sliding out right.',
    art: coffeeArt,
    caption: 'coffee, your way',
    captionIn: 'fade',
    enter: 'rise',
    exit: 'slide-right',
    hold: 1.5,
  },
  {
    id: 'steam',
    description: 'A NAVI mug powers on like a CRT; three steam wisps curl and sway above it.',
    art: steamCup(0),
    caption: 'fresh. hot. yours.',
    enter: 'crt',
    exit: 'dissolve',
    hold: 0.2,
    play: (ctx) => ctx.frames(26, 9, (i) => steamCup(i / 9)),
  },
  {
    id: 'espresso',
    description: 'Espresso machine pours a stream; the cup fills half-row by half-row and gets crema.',
    art: espresso(0),
    caption: 'pulled to order',
    enter: 'decode',
    exit: 'scramble',
    hold: 0.7,
    play: (ctx) => ctx.text(2.6, espresso),
  },
  {
    id: 'naviport',
    description: 'A NaviPort dissolves in, its screen types BOOT … ok / READY and the LED starts blinking.',
    art: naviport(0),
    caption: 'NaviPort online',
    enter: 'dissolve',
    exit: 'crt',
    hold: 0.1,
    play: (ctx) => ctx.text(2.8, naviport),
  },
  {
    id: 'qr',
    description: 'A QR code assembles block by block (finders first), then a scan line sweeps it.',
    art: qr(1),
    caption: 'SCAN → SIP',
    enter: 'blank',
    exit: 'dissolve',
    hold: 0.2,
    play: (ctx) => {
      ctx.text(1.6, qr)
      const h = () => ctx.art.offsetHeight
      ctx.tl.set(ctx.scan, { opacity: 1, y: 0 })
      ctx.tl.to(ctx.scan, { y: h, duration: 0.8, ease: 'sine.inOut', repeat: 1, yoyo: true })
      ctx.tl.to(ctx.scan, { opacity: 0, duration: 0.15 })
    },
  },
  {
    id: 'latte',
    description: 'Top-down latte: the crema decodes in, then a heart is poured in from the dip to the tip.',
    art: latte(0),
    caption: 'made with ♥',
    enter: 'decode',
    exit: 'dissolve',
    hold: 0.9,
    play: (ctx) => ctx.text(1.8, (p) => latte(p)),
  },
  {
    id: 'bean',
    description: 'A shaded coffee bean decodes in and spins in 3D, crease showing on its flat side.',
    art: bean(0),
    caption: 'beans in rotation',
    enter: 'decode',
    exit: 'slide-right',
    hold: 0,
    play: (ctx) => ctx.frames(36, 12, (i) => bean((i / 18) * Math.PI * 2)),
  },
  {
    id: 'terminal',
    description: 'Terminal: the brew command types itself, then each [ok] line decodes in.',
    art: terminal,
    caption: '',
    enter: 'blank',
    exit: 'crt',
    hold: 1.1,
    play: (ctx) => {
      const { w, h } = size(terminal)
      const screen = pad(terminal, w, h)
      const cmd = screen.slice(0, 1)
      const n = cmd[0]!.replace(/ /g, '').length
      ctx.text(0.9, (p) => pad(typewriter(cmd, p * n), w, h))
      const rank = ranks(w, h, 3)
      for (let line = 2; line < h; line++) {
        if (!screen[line]!.trim()) continue
        const upto = line
        ctx.text(0.35, (p) =>
          screen.map((l, i) => (i < upto ? l : i === upto ? decode([l], p, rank.slice(i * w))[0]! : ' '.repeat(w))),
        )
      }
    },
  },
  {
    id: 'progress',
    description: 'ORDER ▸ SCAN ▸ SIP: step markers tick over while a block progress bar fills to 100%.',
    art: progress(0),
    caption: 'ORDER ▸ SCAN ▸ SIP',
    enter: 'rise',
    exit: 'dissolve',
    hold: 0.9,
    play: (ctx) => ctx.text(2.4, (p) => progress(Math.round(p * 26) / 26)),
  },
]
