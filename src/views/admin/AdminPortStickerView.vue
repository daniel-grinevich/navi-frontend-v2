<script setup lang="ts">
/*** libraries ****/
import { computed, onMounted, onBeforeUnmount } from 'vue'
/*** components ****/
import Qrcode from '@/components/shared/Qrcode.vue'
/*** composables ****/
import { useNaviPortBySlug } from '@/composables/useNaviPorts'

const props = defineProps<{ slug: string }>()

const { data: port, isLoading, isError, error } = useNaviPortBySlug(() => props.slug)

const portUrl = computed(() => `${window.location.origin}/p/${encodeURIComponent(props.slug)}`)

// No centre logo: the sticker should scan from arm's length in bad light.
const noImage = { src: '', width: 0, height: 0, excavate: false }

// The print rules below are global (they must hide the app chrome), so they're
// keyed on a root class that only exists while this page is mounted.
const PRINT_CLASS = 'printing-port-sticker'
onMounted(() => document.documentElement.classList.add(PRINT_CLASS))
onBeforeUnmount(() => document.documentElement.classList.remove(PRINT_CLASS))

const print = () => window.print()
</script>

<template>
  <div class="w-full text-xs space-y-4">
    <div class="sticker-toolbar border border-alt flex items-center justify-between">
      <div class="px-3 py-1 bg-green text-primary">// admin · port sticker</div>
      <button
        type="button"
        class="px-3 py-1 cursor-pointer text-green hover:underline font-mono"
        :disabled="!port"
        @click="print"
      >
        ▸ PRINT
      </button>
    </div>

    <p v-if="isLoading" class="font-secondary">loading port...</p>
    <p v-else-if="isError" class="text-red px-2 py-2 border border-red">
      {{ error?.status === 404 ? `No NaviPort with slug "${slug}".` : 'Could not load this port.' }}
    </p>

    <div v-else-if="port" class="sticker">
      <p class="sticker-brand">NAVI</p>
      <h1 class="sticker-name">{{ port.name }}</h1>
      <div class="sticker-qr">
        <Qrcode :value="portUrl" :size="320" level="Q" :margin="2" :image-settings="noImage" />
      </div>
      <p class="sticker-instruction">Scan to order a coffee from this machine</p>
      <p class="sticker-url">{{ portUrl }}</p>
    </div>
  </div>
</template>

<style scoped>
.sticker {
  /* 4x6in, close enough to A6 (105x148mm) to print on either. */
  width: 4in;
  height: 6in;
  margin: 0 auto;
  padding: 0.3in;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  background: #ffffff;
  color: #000000;
  border: 1px dashed #999999;
}

.sticker-brand {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14pt;
  font-weight: bold;
  letter-spacing: 0.3em;
}

.sticker-name {
  font-size: 22pt;
  font-weight: bold;
  line-height: 1.1;
  overflow-wrap: anywhere;
}

.sticker-qr :deep(svg) {
  width: 3in;
  height: 3in;
}

.sticker-instruction {
  font-size: 14pt;
  line-height: 1.2;
}

.sticker-url {
  font-family: 'Courier New', Courier, monospace;
  font-size: 8pt;
  overflow-wrap: anywhere;
}
</style>

<style>
@media print {
  @page {
    size: 4in 6in;
    margin: 0;
  }

  html.printing-port-sticker,
  html.printing-port-sticker body {
    background: #ffffff !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  html.printing-port-sticker body * {
    visibility: hidden;
  }

  html.printing-port-sticker .sticker,
  html.printing-port-sticker .sticker * {
    visibility: visible;
  }

  html.printing-port-sticker .sticker {
    position: fixed;
    top: 0;
    left: 0;
    border: none;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
