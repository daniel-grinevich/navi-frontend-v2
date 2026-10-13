// Text progress bars in the btop/htop style: full blocks, one eighth-block
// partial cell, then an empty fill character.
//   blockBar(0.675, 20)       -> '█████████████▌░░░░░░'
//   blockBar(0.675, 20, '·')  -> '█████████████▌······'

const PARTIALS = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉'] as const

export type BlockBarParts = { filled: string; empty: string }

// Filled and empty runs separately, so they can be coloured differently.
export const blockBarParts = (fraction: number, cols: number, empty = '░'): BlockBarParts => {
  const width = Math.max(0, Math.floor(cols))
  if (width === 0) return { filled: '', empty: '' }

  const clamped = Number.isFinite(fraction) ? Math.min(1, Math.max(0, fraction)) : 0
  const eighths = Math.round(clamped * width * 8)
  const full = Math.floor(eighths / 8)
  const partial = PARTIALS[eighths % 8] ?? ''

  return {
    filled: '█'.repeat(full) + partial,
    empty: empty.repeat(width - full - (partial ? 1 : 0)),
  }
}

export const blockBar = (fraction: number, cols: number, empty = '░'): string => {
  const parts = blockBarParts(fraction, cols, empty)
  return parts.filled + parts.empty
}
