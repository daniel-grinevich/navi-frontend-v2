import { computed } from 'vue'
import type { ZodSchema } from 'zod/v3'
import { useZod } from './useZod'

type AnyFn = (...args: any[]) => any

type FormState = {
  touched?: boolean
  messages?: string[]
  error?: boolean
  hooks?: AnyFn[]
  debounce?: number
}

export function useForm(payload: Map<string, any>, schema: ZodObject) {
  const initFormValues = computed(() => {
    const keyValueMap = new Map<string, FormState>()

    Object.entries(payload).forEach(([key, value]) => {
      keyValueMap.set(key, {
        touched: false,
        messages: [],
        error: false,
        hooks: value['hooks'] || [],
        debounce: value['debounce'] || 0,
      })

      keyValueMap.set(key, {})
    })
    return keyValueMap
  })

  const { zodValueorError } = useZod(initFormValues, schema)

  const validatePayload = () => {}

  return { formValues }
}
