<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { useSessionStore } from '@/stores/session'
import { useShoppingCart } from '@/stores/shoppingCart'
import HealthBar from '@/components/home/HealthBar.vue'
import AchievementsRow from '@/components/home/AchievementsRow.vue'
import { useAchievementsSync } from '@/composables/useAchievements'

const session = useSessionStore()
const cart = useShoppingCart()

// Hydrate achievements from the backend (definitions + per-user progress).
useAchievementsSync()

const steps = [
  {
    n: '01',
    title: 'BROWSE THE MENU',
    desc: 'explore drinks and customize every detail — size, milk, flavor, extras. make it yours.',
    to: '/menu',
    cta: 'VIEW MENU',
  },
  {
    n: '02',
    title: 'PLACE YOUR ORDER',
    desc: 'checkout as a guest or make an account to track orders and earn achievements.',
    to: null,
    cta: null,
  },
  {
    n: '03',
    title: 'PICK UP AT NAVIPORT',
    desc: 'grab your order from the nearest NaviPort. no lines, no waiting — status updates live.',
    to: '/find-navi',
    cta: 'FIND A NAVIPORT',
  },
]

const features = [
  { glyph: '⚡', title: 'NO LINES', desc: 'skip the queue. order ahead, grab and go.' },
  { glyph: '◉', title: 'LIVE TRACKING', desc: 'watch your order status update in real time.' },
  { glyph: '⬡', title: 'GUEST CHECKOUT', desc: 'no account required. order in seconds.' },
  { glyph: '✦', title: 'PAY ANY WAY', desc: 'card, Apple Pay, or Google Pay.' },
]

const stats = [
  { value: '12', label: 'NaviPorts' },
  { value: '2k+', label: 'orders served' },
  { value: '<5m', label: 'avg wait time' },
  { value: '24/7', label: 'always open' },
]

// Animation refs
const logoLines = ref<HTMLElement[]>([])
const coffeeLines = ref<HTMLElement[]>([])
const tagline = ref<HTMLElement | null>(null)
const naviBlock = ref<HTMLElement | null>(null)
const coffeeBlock = ref<HTMLElement | null>(null)

const setLogoLine = (el: any) => {
  if (el) logoLines.value.push(el)
}

const setCoffeeLine = (el: any) => {
  if (el) coffeeLines.value.push(el)
}

// prettier-ignore
const logoArt = [
  '███╗   ██╗ █████╗ ██╗   ██╗██╗',
  '████╗  ██║██╔══██╗██║   ██║██║',
  '██╔██╗ ██║███████║██║   ██║██║',
  '██║╚██╗██║██╔══██║╚██╗ ██╔╝██║',
  '██║ ╚████║██║  ██║ ╚████╔╝ ██║',
  '╚═╝  ╚═══╝╚═╝  ╚═╝  ╚═══╝  ╚═╝',
]

// prettier-ignore
const CoffeeArt = [
  '███████╗███████╗███████╗███████╗███████╗███████╗',
  '██╔════╝██╔══██╗██╔════╝██╔════╝██╔════╝██╔════╝',
  '██║     ██║  ██║███████╗███████╗███████╗███████╗',
  '██║     ██║  ██║██╔════╝██╔════╝██╔════╝██╔════╝',
  '███████╗███████║██║     ██║     ███████╗███████╗',
  ' ╚═════╝ ╚═════╝╚═╝     ╚═╝      ╚═════╝ ╚═════╝',
]

const clock = ref('')
let clockInterval: ReturnType<typeof setInterval>

const updateClock = () => {
  const now = new Date()
  clock.value = now.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)

  const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.out' } })

  gsap.set(coffeeBlock.value, { display: 'none', opacity: 0 })
  gsap.set(naviBlock.value, { display: 'none', opacity: 0 })
  logoLines.value.forEach((el) => gsap.set(el, { opacity: 0, x: -20 }))
  coffeeLines.value.forEach((el) => gsap.set(el, { opacity: 0, y: 20 }))
  if (tagline.value) gsap.set(tagline.value, { opacity: 0 })

  tl.set(naviBlock.value, { display: 'block', opacity: 1, x: 0 })
  logoLines.value.forEach((el, i) => {
    tl.to(el, { opacity: 1, x: 0, duration: 0.25 }, i * 0.1)
  })

  if (tagline.value) {
    tl.to(tagline.value, { opacity: 1, duration: 0.6 }, '-=0.1')
  }

  tl.to([naviBlock.value, tagline.value].filter(Boolean), {
    x: '120%',
    opacity: 0,
    duration: 0.6,
    ease: 'power3.in',
    delay: 1.5,
  })

  tl.set(naviBlock.value, { display: 'none' })
  tl.set(tagline.value, { x: 0, opacity: 0 })
  logoLines.value.forEach((el) => {
    tl.set(el, { opacity: 0, x: -20 })
  })

  tl.set(coffeeBlock.value, { display: 'flex', opacity: 1, x: 0 })
  coffeeLines.value.forEach((el) => {
    tl.to(el, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, '>-0.1')
  })

  if (tagline.value) {
    tl.to(tagline.value, { opacity: 1, duration: 0.5 }, '-=0.1')
  }

  tl.to([coffeeBlock.value, tagline.value].filter(Boolean), {
    x: '120%',
    opacity: 0,
    duration: 0.6,
    ease: 'power3.in',
    delay: 1.5,
  })

  tl.set(coffeeBlock.value, { display: 'none' })
  tl.set(tagline.value, { x: 0, opacity: 0 })
  coffeeLines.value.forEach((el) => {
    tl.set(el, { opacity: 0, y: 20 })
  })
})

onUnmounted(() => {
  clearInterval(clockInterval)
})
</script>

<template>
  <div class="w-full text-xs border border-alt">
    <div class="flex flex-col md:flex-row min-h-[75vh]">
      <div class="md:w-1/2 border-b md:border-b-0 md:border-r border-alt flex flex-col">
        <div class="px-3 py-1 border-b border-alt text-primary bg-green">// home</div>

        <div class="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
          <div ref="naviBlock" class="text-green whitespace-pre leading-none select-none">
            <div v-for="(line, i) in logoArt" :key="i" :ref="setLogoLine">{{ line }}</div>
          </div>

          <div
            ref="coffeeBlock"
            class="flex flex-col items-center text-green whitespace-pre leading-none select-none"
          >
            <div v-for="(line, i) in CoffeeArt" :key="'c' + i" :ref="setCoffeeLine">{{ line }}</div>
          </div>

          <div ref="tagline" class="mt-6 text-center">
            <div class="font-secondary tracking-[0.2em]">coffee, your way</div>
          </div>

          <div></div>
        </div>
      </div>

      <div class="md:w-1/2 flex flex-col">
        <div class="flex-1 flex flex-col">
          <div class="px-3 py-1 border-b border-alt text-alt">// Actions</div>

          <div class="flex flex-col justify-center p-4 gap-2">
            <router-link
              to="/menu"
              class="navi-btn group px-3 py-3 border border-alt text-alt hover:bg-green hover:text-primary hover:border-green transition-all duration-200 cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <span class="text-green group-hover:text-primary">▸</span>
                <span class="tracking-wide font-mono font-bold">START ORDER</span>
                <span class="ml-auto">browse menu &amp; build your drink</span>
              </div>
            </router-link>

            <router-link
              to="/find-navi"
              class="navi-btn group px-3 py-3 border border-alt text-alt hover:bg-green hover:text-primary hover:border-green transition-all duration-200 cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <span class="text-green group-hover:text-primary">▸</span>
                <span class="tracking-wide font-mono font-bold">FIND NAVIPORT</span>
                <span class="ml-auto">pickup spots near you</span>
              </div>
            </router-link>

            <router-link
              v-if="!session.isAuthenticated"
              to="/signup"
              class="navi-btn group px-3 py-3 border border-alt text-alt hover:bg-green hover:text-primary hover:border-green transition-all duration-200 cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <span class="text-green group-hover:text-primary">▸</span>
                <span class="tracking-wide font-mono font-bold">SIGN UP</span>
                <span class="ml-auto">save favorites &amp; track orders</span>
              </div>
            </router-link>

            <router-link
              v-if="session.isAuthenticated"
              to="/orders"
              class="navi-btn group px-3 py-3 border border-alt text-alt hover:bg-green hover:text-primary hover:border-green transition-all duration-200 cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <span class="text-green group-hover:text-primary">▸</span>
                <span class="tracking-wide font-mono font-bold">MY ORDERS</span>
                <span class="ml-auto">view full order history</span>
              </div>
            </router-link>
          </div>
        </div>

        <div class="border-t border-alt">
          <div class="px-3 py-1 border-b border-alt font-secondary">// Achievements</div>
          <HealthBar />
          <AchievementsRow />
        </div>
      </div>
    </div>

  </div>

  <!-- How it works -->
  <div class="w-full text-xs border border-alt mt-10">
    <div class="px-3 py-1 border-b border-alt text-primary bg-green flex items-center justify-between">
      <span>// how_it_works</span>
      <span class="hidden sm:inline opacity-70">3 steps to caffeine</span>
    </div>

    <div class="grid md:grid-cols-3">
      <div
        v-for="(step, i) in steps"
        :key="step.n"
        class="flex flex-col gap-4 p-6 border-alt border-b md:border-b-0"
        :class="i < steps.length - 1 ? 'md:border-r' : ''"
      >
        <div class="flex items-baseline gap-3">
          <span class="text-green font-mono text-4xl leading-none">{{ step.n }}</span>
          <span class="font-secondary tracking-[0.3em]">step</span>
        </div>
        <p class="font-mono font-bold text-sm tracking-wide">{{ step.title }}</p>
        <p class="font-secondary leading-relaxed flex-1">{{ step.desc }}</p>
        <router-link
          v-if="step.to"
          :to="step.to"
          class="navi-btn inline-block px-3 py-2 border border-alt font-mono tracking-wide hover:bg-green hover:text-primary hover:border-green transition-all duration-200 cursor-pointer w-fit"
        >
          <span class="text-green group-hover:text-primary">▸</span> {{ step.cta }}
        </router-link>
      </div>
    </div>
  </div>

  <!-- Why Navi -->
  <div class="w-full text-xs border border-alt mt-10">
    <div class="px-3 py-1 border-b border-alt text-primary bg-green">// why_navi</div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(f, i) in features"
        :key="f.title"
        class="group flex flex-col gap-3 p-6 border-alt border-b sm:border-b lg:border-b-0"
        :class="[
          i < features.length - 1 ? 'lg:border-r' : '',
          i % 2 === 0 ? 'sm:border-r' : '',
        ]"
      >
        <span
          class="text-green text-2xl leading-none transition-transform duration-200 group-hover:scale-125 origin-left"
        >
          {{ f.glyph }}
        </span>
        <p class="font-mono font-bold tracking-wide">{{ f.title }}</p>
        <p class="font-secondary leading-relaxed">{{ f.desc }}</p>
      </div>
    </div>
  </div>

  <!-- About + Stats -->
  <div class="w-full text-xs border border-alt mt-10">
    <div class="px-3 py-1 border-b border-alt text-primary bg-green">// about_navi</div>

    <div class="flex flex-col md:flex-row">
      <div class="md:w-1/2 flex flex-col justify-center gap-4 px-8 py-10 md:border-r border-b md:border-b-0 border-alt">
        <p class="font-mono text-sm leading-relaxed">
          great drinks shouldn't come with long lines.
        </p>
        <p class="font-secondary leading-relaxed">
          NAVI is a network of automated pickup points —
          <span class="text-green font-mono">NaviPorts</span> — built to get your order to you
          fast, fresh, and exactly how you like it.
        </p>
        <p class="font-mono text-green">no storefronts. no queues. just good drinks.</p>
      </div>

      <div class="md:w-1/2 grid grid-cols-2">
        <div
          v-for="(s, i) in stats"
          :key="s.label"
          class="flex flex-col items-center justify-center gap-2 px-4 py-10 border-alt"
          :class="[i % 2 === 0 ? 'border-r' : '', i < 2 ? 'border-b' : '']"
        >
          <p class="text-green font-mono text-3xl">{{ s.value }}</p>
          <p class="font-secondary">{{ s.label }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Closing CTA -->
  <div class="w-full text-xs border border-green bg-green text-primary mt-10 mb-10">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-8">
      <div class="flex flex-col gap-1 text-center sm:text-left">
        <p class="font-mono font-bold text-sm tracking-wide">READY WHEN YOU ARE</p>
        <p class="opacity-80">your next drink is a few taps away.</p>
      </div>
      <router-link
        to="/menu"
        class="navi-btn inline-block px-5 py-3 border border-primary bg-primary text-alt font-mono font-bold tracking-wide hover:bg-transparent hover:text-primary hover:border-primary transition-all duration-200 cursor-pointer whitespace-nowrap"
      >
        ▸ START ORDER
      </router-link>
    </div>
  </div>
</template>
