<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import gsap from 'gsap'
import {
  useDocumentVisibility,
  useIntersectionObserver,
  usePreferredReducedMotion,
} from '@vueuse/core'
import { blank, dissolve, pad, ranks, size, type Screen } from './hero/ascii'
import { logoArt, scenes, type EnterKind, type ExitKind, type SceneCtx } from './hero/scenes'

/* The stage is sized for the largest scene so the hero never jumps. */
const rows = Math.max(...scenes.map((s) => s.art.length))
const cols = Math.max(...scenes.map((s) => size(s.art).w))

const TAGLINE = 'coffee, your way'
// Gentle easing throughout; the intro should feel unhurried.
const EASE = 'sine.inOut'

const root = useTemplateRef<HTMLElement>('root')
const artEl = useTemplateRef<HTMLElement>('art')
const captionEl = useTemplateRef<HTMLElement>('captionEl')

const lines = ref<Screen>(logoArt)
const caption = ref(TAGLINE)

const motion = usePreferredReducedMotion()
const visibility = useDocumentVisibility()
const inView = ref(true)
useIntersectionObserver(root, ([entry]) => {
  inView.value = entry?.isIntersecting ?? true
})

const animate = computed(() => motion.value !== 'reduce')
const running = computed(() => animate.value && visibility.value === 'visible' && inView.value)

let tl: gsap.core.Timeline | null = null
// Bumped on every scene switch so a stale async play() bails out.
let token = 0

const lineEls = () => (artEl.value ? (Array.from(artEl.value.children) as HTMLElement[]) : [])

async function play(index: number) {
  const my = ++token
  tl?.kill()
  tl = null

  const scene = scenes[index]!
  const isLast = index === scenes.length - 1
  const { w, h } = size(scene.art)
  const fit = (s: Screen) => pad(s, w, h)
  const art = fit(scene.art)

  lines.value = art
  caption.value = scene.caption
  await nextTick()

  const artNode = artEl.value
  const capNode = captionEl.value
  if (my !== token || !artNode || !capNode) return
  gsap.set([artNode, capNode, ...lineEls()], { clearProps: 'all' })
  gsap.set(capNode, { opacity: 0 })

  const t = gsap.timeline({
    paused: !running.value,
    defaults: { ease: 'power2.out' },
    onComplete: isLast ? undefined : () => void play(index + 1),
  })
  tl = t

  const show = (s: Screen) => {
    lines.value = fit(s)
  }
  const ctx: SceneCtx = {
    tl: t,
    show,
    text: (duration, render, ease = 'none') => {
      const o = { p: 0 }
      t.to(o, { p: 1, duration, ease, onUpdate: () => show(render(o.p)) })
    },
    loop: (fps, render) => {
      let frame = 0
      t.to({}, { duration: 1 / fps, repeat: -1, onRepeat: () => show(render(++frame / fps)) })
    },
  }

  const enter: Record<EnterKind, () => void> = {
    // snappy: the whole block snaps on with a small overshoot
    pop: () => {
      t.fromTo(artNode, { opacity: 0 }, { opacity: 1, duration: 0.06, ease: 'none' })
      t.fromTo(artNode, { scale: 0.75 }, { scale: 1, duration: 0.22, ease: 'back.out(2.5)' }, '<')
    },
    fade: () => {
      t.fromTo(artNode, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: EASE })
    },
  }

  const exit: Record<ExitKind, () => void> = {
    // quick, so NAVI → COFFEE reads as one snappy beat
    fade: () => t.to([artNode, capNode], { opacity: 0, duration: 0.3, ease: 'power1.in' }),
    dissolve: () => {
      const rank = ranks(w, h, index + 1)
      const empty = blank(w, h)
      let from = art
      const o = { p: 0 }
      t.to(o, {
        p: 1,
        duration: 1.6,
        ease: EASE,
        onStart: () => {
          from = lines.value.slice()
        },
        onUpdate: () => show(dissolve(from, empty, o.p, rank)),
      })
      t.to(capNode, { opacity: 0, duration: 1, ease: EASE }, '<')
    },
  }

  enter[scene.enter]()
  t.addLabel('shown')
  if (scene.caption) {
    const snappy = scene.enter === 'pop'
    t.to(capNode, { opacity: 1, duration: snappy ? 0.5 : 1.4, ease: EASE }, snappy ? 'shown' : 'shown-=0.2')
  }
  scene.play?.(ctx)

  if (scene.exit) {
    t.to({}, { duration: scene.hold })
    exit[scene.exit]()
  }
}

function showStatic() {
  token++
  tl?.kill()
  tl = null
  lines.value = logoArt
  caption.value = TAGLINE
  const nodes = [artEl.value, captionEl.value, ...lineEls()].filter(Boolean)
  if (nodes.length) gsap.set(nodes, { clearProps: 'all' })
}

watch(animate, (on) => (on ? void play(0) : showStatic()))
watch(running, (on) => {
  if (!tl) return
  if (on) tl.resume()
  else tl.pause()
})

onMounted(() => {
  if (animate.value) void play(0)
})

onBeforeUnmount(() => {
  token++
  tl?.kill()
  tl = null
})
</script>

<template>
  <div ref="root" class="hero w-full flex flex-col items-center justify-center">
    <span class="sr-only">NAVI: coffee, your way</span>

    <div class="hero-stage" aria-hidden="true" :style="{ '--rows': rows, '--cols': cols }">
      <div ref="art" class="text-green whitespace-pre leading-none select-none">
        <div v-for="(line, i) in lines" :key="i">{{ line }}</div>
      </div>
    </div>

    <div class="mt-6 text-center" aria-hidden="true">
      <div ref="captionEl" class="font-secondary whitespace-pre">{{ caption || ' ' }}</div>
    </div>
  </div>
</template>

<style scoped>
.hero {
  container-type: inline-size;
}

/* Shrink the art to fit narrow columns; never grow past the body size.
   JetBrains Mono's advance is 0.6em, so --cols chars need --cols × 0.6em. */
.hero-stage {
  font-size: min(1em, calc(100cqi / (var(--cols) + 2) / 0.6));
  height: calc(var(--rows) * 1em);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
