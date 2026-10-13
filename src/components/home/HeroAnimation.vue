<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import gsap from 'gsap'
import {
  useDocumentVisibility,
  useIntersectionObserver,
  usePreferredReducedMotion,
} from '@vueuse/core'
import { blank, decode, dissolve, pad, ranks, size, type Screen } from './hero/ascii'
import { scenes, type EnterKind, type ExitKind, type SceneCtx } from './hero/scenes'

/* The stage is sized for the largest scene so the hero never jumps. */
const rows = Math.max(...scenes.map((s) => s.art.length))
const cols = Math.max(...scenes.map((s) => size(s.art).w))

const root = useTemplateRef<HTMLElement>('root')
const artEl = useTemplateRef<HTMLElement>('art')
const captionEl = useTemplateRef<HTMLElement>('captionEl')
const scanEl = useTemplateRef<HTMLElement>('scan')

const first = scenes[0]!
const lines = ref<Screen>(first.art)
const caption = ref(first.caption)
const current = ref(0)

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

const lineEls = () =>
  artEl.value ? (Array.from(artEl.value.children) as HTMLElement[]) : []

async function play(index: number) {
  const my = ++token
  tl?.kill()
  tl = null

  const scene = scenes[index]!
  const { w, h } = size(scene.art)
  const fit = (s: Screen) => pad(s, w, h)
  const art = fit(scene.art)
  const empty = blank(w, h)
  const lineBased: EnterKind[] = ['slide', 'rise', 'crt']

  current.value = index
  lines.value = lineBased.includes(scene.enter) ? art : empty
  caption.value = scene.captionIn === 'fade' ? scene.caption : ''
  await nextTick()

  const artNode = artEl.value
  const capNode = captionEl.value
  const scanNode = scanEl.value
  if (my !== token || !artNode || !capNode || !scanNode) return
  gsap.set([artNode, capNode, scanNode, ...lineEls()], { clearProps: 'all' })

  const t = gsap.timeline({
    paused: !running.value,
    defaults: { ease: 'power2.out' },
    onComplete: () => void play((index + 1) % scenes.length),
  })
  tl = t

  const show = (s: Screen) => {
    lines.value = fit(s)
  }
  const text: SceneCtx['text'] = (duration, render, position) => {
    const o = { p: 0 }
    t.to(o, { p: 1, duration, ease: 'none', onUpdate: () => show(render(o.p)) }, position)
  }
  // Exits start from whatever frame the scene ended on.
  const textFromCurrent = (duration: number, render: (from: Screen, p: number) => Screen) => {
    const o = { p: 0 }
    let from = art
    t.to(o, {
      p: 1,
      duration,
      ease: 'none',
      onStart: () => {
        from = lines.value.slice()
      },
      onUpdate: () => show(render(from, o.p)),
    })
  }
  const ctx: SceneCtx = {
    tl: t,
    show,
    text,
    frames: (count, fps, render, position) =>
      text(count / fps, (p) => render(Math.min(count - 1, Math.floor(p * count))), position),
    scan: scanNode,
    art: artNode,
  }
  const rank = ranks(w, h, index + 1)

  const enter: Record<EnterKind, () => void> = {
    // scene 1, as before: lines slide in from the left, staggered
    slide: () => {
      const els = lineEls()
      gsap.set(els, { opacity: 0, x: -20 })
      els.forEach((el, i) => t.to(el, { opacity: 1, x: 0, duration: 0.25 }, i * 0.1))
    },
    // scene 2, as before: lines rise into place one after another
    rise: () => {
      const els = lineEls()
      gsap.set(els, { opacity: 0, y: 20 })
      els.forEach((el) => t.to(el, { opacity: 1, y: 0, duration: 0.2 }, '>-0.1'))
    },
    // CRT power-on: a bright line opens vertically, one soft flicker
    crt: () => {
      t.fromTo(
        artNode,
        { scaleY: 0.03, scaleX: 0.3, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.18, ease: 'power1.out' },
      )
      t.to(artNode, { scaleY: 1, duration: 0.28, ease: 'power3.out' })
      t.to(artNode, { opacity: 0.6, duration: 0.06 })
      t.to(artNode, { opacity: 1, duration: 0.1 })
    },
    decode: () => text(0.7, (p) => decode(art, p, rank)),
    dissolve: () => text(0.7, (p) => dissolve(empty, art, p, rank)),
    blank: () => {},
  }

  const fadeCaption = () => t.to(capNode, { opacity: 0, duration: 0.35 }, '<')
  const exit: Record<ExitKind, () => void> = {
    'slide-right': () =>
      t.to([artNode, capNode], { x: '120%', opacity: 0, duration: 0.6, ease: 'power3.in' }),
    dissolve: () => {
      textFromCurrent(0.6, (from, p) => dissolve(from, empty, p, rank))
      fadeCaption()
    },
    scramble: () => {
      textFromCurrent(0.6, (from, p) => decode(from, 1 - p, rank))
      fadeCaption()
    },
    crt: () => {
      t.to(artNode, { scaleY: 0.03, duration: 0.2, ease: 'power2.in' })
      fadeCaption()
      t.to(artNode, { scaleX: 0, opacity: 0, duration: 0.16, ease: 'power2.in' })
    },
  }

  enter[scene.enter]()
  t.addLabel('shown')
  scene.play?.(ctx)

  if (scene.captionIn === 'fade') {
    gsap.set(capNode, { opacity: 0 })
    t.to(capNode, { opacity: 1, duration: 0.6 }, 'shown-=0.1')
  } else if (scene.caption) {
    const target = [scene.caption]
    const capRank = ranks([...scene.caption].length, 1, index + 7)
    const o = { p: 0 }
    t.to(
      o,
      {
        p: 1,
        duration: 0.6,
        ease: 'none',
        onUpdate: () => {
          caption.value = decode(target, o.p, capRank)[0]!
        },
      },
      'shown',
    )
  }

  t.to({}, { duration: scene.hold })
  exit[scene.exit]()
}

function showStatic() {
  token++
  tl?.kill()
  tl = null
  current.value = 0
  lines.value = first.art
  caption.value = first.caption
  const nodes = [artEl.value, captionEl.value, scanEl.value, ...lineEls()].filter(Boolean)
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
      <div class="relative">
        <div ref="art" class="text-green whitespace-pre leading-none select-none">
          <div v-for="(line, i) in lines" :key="i">{{ line }}</div>
        </div>
        <div ref="scan" class="hero-scan" />
      </div>
    </div>

    <div class="mt-6 text-center" aria-hidden="true">
      <div ref="captionEl" class="font-secondary whitespace-pre">{{ caption || ' ' }}</div>
    </div>

    <div v-if="animate" class="hero-dots mt-3 font-secondary select-none" aria-hidden="true">
      <span
        v-for="(s, i) in scenes"
        :key="s.id"
        :class="i === current ? 'text-green' : i < current ? '' : 'opacity-40'"
        >■</span
      >
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

.hero-scan {
  position: absolute;
  left: -0.75em;
  right: -0.75em;
  top: -0.3em;
  height: 0.6em;
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(
    to bottom,
    transparent,
    color-mix(in srgb, var(--color-green) 55%, transparent),
    transparent
  );
}

.hero-dots {
  letter-spacing: 0.35em;
  line-height: 1;
}
</style>
