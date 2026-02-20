import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { VueQueryPlugin } from '@tanstack/vue-query'

const vueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        retry: (failureCount: number, error: any) => {
          if (import.meta.env.VITE_ENVIRONMENT === 'dev') {
            return false
          }

          if (error.response?.status === 401) {
            return failureCount < 2
          }

          return failureCount < 3
        },
      },
    },
  },
}

import '@stripe/stripe-js'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin, vueQueryPluginOptions)

app.mount('#app')
