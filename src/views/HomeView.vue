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
</template>
