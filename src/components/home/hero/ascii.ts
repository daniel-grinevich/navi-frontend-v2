/** Small text-mode helpers for the hero scenes. Everything works on
 *  string[] "screens" so scenes stay plain data + pure functions. */

export type Screen = string[]

const NOISE = '░▒▓█<>/\\|#*+=:'

/** Deterministic PRNG so dissolve/decode orders are stable per seed. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function size(s: Screen) {
  return { w: Math.max(0, ...s.map((l) => [...l].length)), h: s.length }
}

/** Pad every line to `w` and the screen to `h` lines. */
export function pad(s: Screen, w: number, h = s.length): Screen {
  const out = s.slice(0, h).map((l) => l + ' '.repeat(Math.max(0, w - [...l].length)))
  while (out.length < h) out.push(' '.repeat(w))
  return out
}

export function blank(w: number, h: number): Screen {
  return Array.from({ length: h }, () => ' '.repeat(w))
}

/** A mutable char grid for building art procedurally. */
export function grid(w: number, h: number) {
  const cells = Array.from({ length: h }, () => Array<string>(w).fill(' '))
  return {
    cells,
    set(x: number, y: number, ch: string) {
      if (y >= 0 && y < h && x >= 0 && x < w) cells[y]![x] = ch
    },
    text(x: number, y: number, str: string) {
      ;[...str].forEach((ch, i) => this.set(x + i, y, ch))
    },
    lines(): Screen {
      return cells.map((r) => r.join(''))
    },
  }
}

/** Per-cell rank in [0,1) for a w×h screen; same seed → same order. */
export function ranks(w: number, h: number, seed = 1): number[] {
  const r = rng(seed)
  return Array.from({ length: w * h }, () => r())
}

function mapChars(s: Screen, fn: (ch: string, i: number) => string, w: number): Screen {
  return s.map((line, y) => [...line].map((ch, x) => fn(ch, y * w + x)).join(''))
}

/** Pixel dissolve: each cell switches from `from` to `to` once its rank < p. */
export function dissolve(from: Screen, to: Screen, p: number, rank: number[]): Screen {
  const w = size(to).w
  const src = pad(from, w, to.length)
  return mapChars(to, (ch, i) => ((rank[i] ?? 0) < p ? ch : [...src[Math.floor(i / w)]!][i % w]!), w)
}

/** Terminal decode: cells flicker through noise, then lock to the target.
 *  p=0 → blank, p=1 → target. Spaces stay spaces. */
export function decode(target: Screen, p: number, rank: number[], noise = rng(Math.floor(p * 997))) {
  const w = size(target).w
  return mapChars(
    target,
    (ch, i) => {
      if (ch === ' ') return ch
      const r = (rank[i] ?? 0) * 0.75
      if (p >= r + 0.25) return ch
      if (p >= r) return NOISE[Math.floor(noise() * NOISE.length)]!
      return ' '
    },
    w,
  )
}

/** Typewriter: the first `n` non-space cells in reading order, plus a cursor. */
export function typewriter(target: Screen, n: number, cursor = '█'): Screen {
  let left = Math.floor(n)
  let placed = false
  return target.map((line) =>
    [...line]
      .map((ch) => {
        if (ch === ' ') return ' '
        if (left > 0) {
          left--
          return ch
        }
        if (!placed) {
          placed = true
          return cursor
        }
        return ' '
      })
      .join(''),
  )
}

export function countChars(s: Screen) {
  return s.join('').replace(/ /g, '').length
}
