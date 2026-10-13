/** Small text-mode helpers for the hero scenes. Everything works on
 *  string[] "screens" so scenes stay plain data + pure functions. */

export type Screen = string[]

/** Deterministic PRNG so dissolve orders are stable per seed. */
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

function mapChars(s: Screen, fn: (ch: string, i: number) => string, w: number): Screen {
  return s.map((line, y) => [...line].map((ch, x) => fn(ch, y * w + x)).join(''))
}

/** Pixel dissolve: each cell switches from `from` to `to` once its rank < p. */
export function dissolve(from: Screen, to: Screen, p: number, rank: number[]): Screen {
  const w = size(to).w
  const src = pad(from, w, to.length)
  return mapChars(to, (ch, i) => ((rank[i] ?? 0) < p ? ch : [...src[Math.floor(i / w)]!][i % w]!), w)
}
