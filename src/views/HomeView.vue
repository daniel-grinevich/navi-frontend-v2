<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { useSessionStore } from '@/stores/session'
import { useShoppingCart } from '@/stores/shoppingCart'
import HealthBar from '@/components/home/HealthBar.vue'
import AchievementsRow from '@/components/home/AchievementsRow.vue'

const session = useSessionStore()
const cart = useShoppingCart()

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

  <!-- Step 1 -->
  <div class="w-full text-xs border border-alt mt-10">
    <div class="px-3 py-1 border-b border-alt text-primary bg-green">// step 01</div>
    <div class="flex flex-col md:flex-row min-h-[30vh]">
      <div class="md:w-1/3 flex items-center justify-center py-10 md:border-r border-b md:border-b-0 border-alt">
        <span class="text-green font-mono text-5xl">01</span>
      </div>
      <div class="md:w-2/3 flex flex-col justify-center px-8 py-10">
        <p class="font-mono font-bold text-sm">BROWSE THE MENU</p>
        <p class="font-secondary mt-3 leading-relaxed">explore drinks, customize every detail — size, milk, flavor, extras. make it yours.</p>
        <div class="mt-6">
          <router-link
            to="/menu"
            class="navi-btn inline-block px-4 py-2 border border-alt font-mono tracking-wide hover:bg-green hover:text-primary hover:border-green transition-all duration-200 cursor-pointer"
          >
            <span class="text-green">▸</span> VIEW MENU
          </router-link>
        </div>
      </div>
    </div>
  </div>

  <!-- Step 2 -->
  <div class="w-full text-xs border border-alt mt-10">
    <div class="px-3 py-1 border-b border-alt text-primary bg-green">// step 02</div>
    <div class="flex flex-col md:flex-row min-h-[30vh]">
      <div class="md:w-2/3 flex flex-col justify-center px-8 py-10 md:border-r border-b md:border-b-0 border-alt">
        <p class="font-mono font-bold text-sm">PLACE YOUR ORDER</p>
        <p class="font-secondary mt-3 leading-relaxed">no account needed. checkout as a guest or create one to track orders and earn achievements. pay with card, Apple Pay, or Google Pay.</p>
      </div>
      <div class="md:w-1/3 flex items-center justify-center py-10">
        <span class="text-green font-mono text-5xl">02</span>
      </div>
    </div>
  </div>

  <!-- Step 3 -->
  <div class="w-full text-xs border border-alt mt-10">
    <div class="px-3 py-1 border-b border-alt text-primary bg-green">// step 03</div>
    <div class="flex flex-col md:flex-row min-h-[30vh]">
      <div class="md:w-1/3 flex items-center justify-center py-10 md:border-r border-b md:border-b-0 border-alt">
        <span class="text-green font-mono text-5xl">03</span>
      </div>
      <div class="md:w-2/3 flex flex-col justify-center px-8 py-10">
        <p class="font-mono font-bold text-sm">PICK UP AT NAVIPORT</p>
        <p class="font-secondary mt-3 leading-relaxed">grab your order from the nearest NaviPort. no lines, no waiting. track your order status live — it updates automatically.</p>
        <div class="mt-6">
          <router-link
            to="/find-navi"
            class="navi-btn inline-block px-4 py-2 border border-alt font-mono tracking-wide hover:bg-green hover:text-primary hover:border-green transition-all duration-200 cursor-pointer"
          >
            <span class="text-green">▸</span> FIND A NAVIPORT
          </router-link>
        </div>
      </div>
    </div>
  </div>

  <!-- About + Stats -->
  <div class="w-full text-xs border border-alt mt-10 mb-10">
    <div class="px-3 py-1 border-b border-alt text-primary bg-green">// about navi</div>

    <div class="flex flex-col md:flex-row min-h-[30vh]">
      <div class="md:w-1/2 flex flex-col justify-center px-8 py-10 md:border-r border-b md:border-b-0 border-alt">
        <p class="font-mono text-sm leading-relaxed">NAVI was built on a simple idea: great drinks shouldn't come with long lines.</p>
        <p class="font-secondary mt-4 leading-relaxed">we're a network of automated pickup points — <span class="text-green font-mono">NaviPorts</span> — designed to get your order to you fast, fresh, and exactly how you like it.</p>
        <p class="mt-6 font-mono text-green">no storefronts. no queues. just good drinks.</p>
      </div>

      <div class="md:w-1/2 grid grid-cols-2">
        <div class="px-4 py-8 border-r border-b border-alt flex flex-col items-center justify-center">
          <p class="text-green font-mono text-3xl">12</p>
          <p class="font-secondary mt-2">NaviPorts</p>
        </div>
        <div class="px-4 py-8 border-b border-alt flex flex-col items-center justify-center">
          <p class="text-green font-mono text-3xl">2k+</p>
          <p class="font-secondary mt-2">orders served</p>
        </div>
        <div class="px-4 py-8 border-r border-alt flex flex-col items-center justify-center">
          <p class="text-green font-mono text-3xl">&lt;5m</p>
          <p class="font-secondary mt-2">avg wait time</p>
        </div>
        <div class="px-4 py-8 flex flex-col items-center justify-center">
          <p class="text-green font-mono text-3xl">24/7</p>
          <p class="font-secondary mt-2">always open</p>
        </div>
      </div>
    </div>
  </div>
</template>
