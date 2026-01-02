<script setup lang="ts">
import { ref } from 'vue'
import QrcodeVue from 'qrcode.vue'
import type { Level, RenderAs, GradientType, ImageSettings } from 'qrcode.vue'

const props = withDefaults(
  defineProps<{
    value: string
    size?:number
    level?: Level
    renderAs?: RenderAs
    background?: string
    foreground?: string
    margin?: number
    imageSettings?: ImageSettings
    gradient?:boolean
    gradientType?:GradientType
    gradientStartColor?:string
    gradientEndColor?:string
  }>(),
  {
    value: '',
    size:100,
    level: 'M',
    renderAs: 'svg',
    background: '#ffffff',
    foreground: '#000000',
    margin: 0,
    imageSettings:() => ({
      src: 'https://github.com/scopewu.png',
      width: 30,
      height: 30,
      excavate: true,
    }),
    gradient:false,
    gradientType:'linear',
    gradientStartColor:'#000000',
    gradientEndColor:'#38bdf8',
  },
)
</script>
<template>
  <qrcode-vue
    :value="value"
    :size="size"
    :level="level"
    :render-as="renderAs"
    :background="background"
    :foreground="foreground"
    :gradient="gradient"
    :gradient-type="gradientType"
    :gradient-start-color="gradientStartColor"
    :gradient-end-color="gradientEndColor"
    :image-settings="imageSettings"
  />
</template>
