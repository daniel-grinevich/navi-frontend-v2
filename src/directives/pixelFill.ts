import type { Directive } from 'vue'
import './pixelFill.css'

/**
 * v-pixel-fill — on hover, keyboard focus or tap the element fills with
 * square "pixels" in a diagonal sweep with a little jitter, then the text
 * flips to the light colour. Unfills on leave.
 *
 *   <button v-pixel-fill>…</button>
 *   <a v-pixel-fill="{ color: 'var(--color-alt)' }">…</a>
 *   <button v-pixel-fill="false">…</button>   (off)
 *
 * The canvas is created lazily on first interaction, so lists of cards
 * cost nothing until touched. prefers-reduced-motion fills instantly.
 */

export interface PixelFillOptions {
  /** CSS colour for the pixels (and the border while filled). */
  color?: string
  /** Pixel size in CSS px. */
  cell?: number
  /** Fill duration in ms (unfill runs a bit faster). */
  duration?: number
}

type PixelFillValue = PixelFillOptions | boolean | undefined

const FLIP_AT = 0.45
const TOUCH_HOLD_MS = 450

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

class PixelFill {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private order = new Float32Array(0)
  private cols = 0
  private rows = 0
  private width = 0
  private height = 0
  private color = ''
  private progress = 0
  private target = 0
  private raf = 0
  private last = 0
  private hovered = false
  private focused = false
  private touched = false
  private touchTimer: ReturnType<typeof setTimeout> | undefined
  enabled = true
  opts: Required<PixelFillOptions> = { color: '', cell: 6, duration: 260 }

  constructor(private el: HTMLElement) {
    el.dataset.pixelFill = 'off'
    el.addEventListener('pointerenter', this.onEnter)
    el.addEventListener('pointerleave', this.onLeave)
    el.addEventListener('pointerdown', this.onDown)
    el.addEventListener('pointerup', this.onUp)
    el.addEventListener('pointercancel', this.onUp)
    el.addEventListener('focusin', this.onFocus)
    el.addEventListener('focusout', this.onBlur)
  }

  configure(value: PixelFillValue) {
    this.enabled = value !== false
    const o = typeof value === 'object' ? value : {}
    this.opts = { color: o.color ?? '', cell: o.cell ?? 6, duration: o.duration ?? 260 }
    if (this.opts.color) this.el.style.setProperty('--pf-color', this.opts.color)
    else this.el.style.removeProperty('--pf-color')
    this.sync()
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    clearTimeout(this.touchTimer)
    const el = this.el
    el.removeEventListener('pointerenter', this.onEnter)
    el.removeEventListener('pointerleave', this.onLeave)
    el.removeEventListener('pointerdown', this.onDown)
    el.removeEventListener('pointerup', this.onUp)
    el.removeEventListener('pointercancel', this.onUp)
    el.removeEventListener('focusin', this.onFocus)
    el.removeEventListener('focusout', this.onBlur)
    this.canvas?.remove()
  }

  private onEnter = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    this.hovered = true
    this.sync()
  }

  private onLeave = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    this.hovered = false
    this.sync()
  }

  // Touch: a quick fill on tap, released shortly after the finger lifts.
  private onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return
    clearTimeout(this.touchTimer)
    this.touched = true
    this.sync()
  }

  private onUp = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return
    clearTimeout(this.touchTimer)
    this.touchTimer = setTimeout(() => {
      this.touched = false
      this.sync()
    }, TOUCH_HOLD_MS)
  }

  // Only keyboard focus fills; a mouse click that focuses shouldn't stick.
  private onFocus = (e: FocusEvent) => {
    const t = e.target
    this.focused = t instanceof HTMLElement && t.matches(':focus-visible')
    this.sync()
  }

  private onBlur = () => {
    this.focused = false
    this.sync()
  }

  private isDisabled() {
    return (
      (this.el as HTMLButtonElement).disabled === true ||
      this.el.getAttribute('aria-disabled') === 'true'
    )
  }

  sync() {
    const on = this.enabled && !this.isDisabled() && (this.hovered || this.focused || this.touched)
    this.setTarget(on ? 1 : 0)
  }

  private setTarget(target: number) {
    if (target === this.target && (this.raf || this.progress === target)) return
    this.target = target
    if (target === 1) this.prepare()
    if (!this.ctx) return

    if (reducedMotion()) {
      this.progress = target
      this.draw()
      return
    }
    if (!this.raf) {
      this.last = performance.now()
      this.raf = requestAnimationFrame(this.tick)
    }
  }

  private tick = (now: number) => {
    const dt = Math.min(now - this.last, 50)
    this.last = now
    const speed = dt / (this.target > this.progress ? this.opts.duration : this.opts.duration * 0.7)
    this.progress =
      this.target > this.progress
        ? Math.min(this.target, this.progress + speed)
        : Math.max(this.target, this.progress - speed)
    this.draw()
    this.raf = this.progress === this.target ? 0 : requestAnimationFrame(this.tick)
  }

  /** Create the canvas on first use and rebuild the grid if the size changed. */
  private prepare() {
    if (!this.canvas) {
      const c = document.createElement('canvas')
      c.className = 'pixel-fill-canvas'
      c.setAttribute('aria-hidden', 'true')
      this.el.prepend(c)
      this.canvas = c
      this.ctx = c.getContext('2d')
    } else if (this.canvas.parentNode !== this.el) {
      // Vue replaced the element's text content and dropped the canvas.
      this.el.prepend(this.canvas)
    }
    // The canvas' own `color` resolves --pf-color (incl. light-dark()) to rgb.
    this.color = getComputedStyle(this.canvas).color

    const w = this.el.clientWidth
    const h = this.el.clientHeight
    if (w === this.width && h === this.height) return
    this.width = w
    this.height = h

    const dpr = window.devicePixelRatio || 1
    this.canvas.width = Math.max(1, Math.round(w * dpr))
    this.canvas.height = Math.max(1, Math.round(h * dpr))
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)

    const cell = this.opts.cell
    this.cols = Math.ceil(w / cell)
    this.rows = Math.ceil(h / cell)
    this.order = new Float32Array(this.cols * this.rows)
    // Diagonal sweep from the top-left, roughened so blocks "snap" on in
    // small random clusters instead of a clean wipe.
    const span = this.cols + this.rows * 1.5 || 1
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const diag = (x + y * 1.5) / span
        this.order[y * this.cols + x] = Math.min(0.999, diag * 0.7 + Math.random() * 0.3)
      }
    }
  }

  private draw() {
    const ctx = this.ctx
    if (!ctx) return
    ctx.clearRect(0, 0, this.width, this.height)
    if (this.progress > 0) {
      ctx.fillStyle = this.color
      if (this.progress >= 1) {
        ctx.fillRect(0, 0, this.width, this.height)
      } else {
        const cell = this.opts.cell
        for (let i = 0; i < this.order.length; i++) {
          if (this.order[i]! < this.progress) {
            ctx.fillRect((i % this.cols) * cell, Math.floor(i / this.cols) * cell, cell, cell)
          }
        }
      }
    }
    const flipped = this.target === 1 ? this.progress >= FLIP_AT : this.progress > FLIP_AT
    this.el.dataset.pixelFill = flipped ? 'on' : 'off'
  }
}

const instances = new WeakMap<HTMLElement, PixelFill>()

export const vPixelFill: Directive<HTMLElement, PixelFillValue> = {
  mounted(el, binding) {
    const pf = new PixelFill(el)
    instances.set(el, pf)
    pf.configure(binding.value)
  },
  updated(el, binding) {
    const pf = instances.get(el)
    if (!pf) return
    // Inline object literals are new on every render; compare by content.
    if (JSON.stringify(binding.value) !== JSON.stringify(binding.oldValue)) pf.configure(binding.value)
    // Re-check `disabled`, which may have changed with the component.
    else pf.sync()
  },
  beforeUnmount(el) {
    instances.get(el)?.destroy()
    instances.delete(el)
  },
}

export default vPixelFill
