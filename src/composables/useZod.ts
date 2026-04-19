/*** libraries ****/
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import z, { ZodObject } from 'zod'
/*** components ****/
/*** stores ***/
/*** composables ****/
/*** types ****/

export const useZod = (ref: MaybeRefOrGetter<object>, schema: ZodObject<any>) => {
  const schemaKeys = computed(() => Object.keys(schema.shape))

  const unsupportedTypeMessage = (unsupportedType: string): Record<string, string[]> => {
    return { form: [`${unsupportedType} is an unsupported type.`] }
  }

  const zodValueorError = computed(() => {
    const input = toValue(ref)

    switch (typeof input) {
      case 'object':
        if (input === null) {
          return { success: false, error: unsupportedTypeMessage('Null') }
        } else if (Array.isArray(input)) {
          validateArrayWithSchema(input)
        } else {
          const result = schema.safeParse(input)
          return result.success
            ? { success: true, data: result.data }
            : { success: false, error: handleZodErrors(result.error.issues) }
        }
      case 'string':
        const stringResult = schema.safeParse(input)
        return stringResult.success
          ? { success: true, data: stringResult.data }
          : { success: false, error: handleZodErrors(stringResult.error.issues) }

      case 'number':
        const numberResult = schema.safeParse(input)
        return numberResult.success
          ? { success: true, data: numberResult.data }
          : { success: false, error: handleZodErrors(numberResult.error.issues) }

      default:
        return { success: false, error: unsupportedTypeMessage('Unknown') }
    }
  })

  const validateArrayWithSchema = (input: object[]) => {
    return input.map((item) => {
      validateWithSchema(item)
    })
  }

  const validateWithSchema = (item: Record<any, any>) => {
    const result: Record<any, any> = {}

    for (const schemaKey of schemaKeys.value as string[]) {
      if (schemaKey in item) {
        result[schemaKey] = item[schemaKey]
      }
    }

    const validatedInput = schema.safeParse(result)

    if (validatedInput.success) {
      return validatedInput.data
    } else {
      return handleZodErrors(validatedInput.error.issues)
    }
  }

  const handleZodErrors = (zodError: z.core.$ZodIssue[]) => {
    const errorMessages: Record<string, any> = {}
    zodError.forEach((error) => {
      const errorIndex = error.path.length === 1 ? 0 : error.path.length - 1
      const key = String(error.path[errorIndex] ?? 'Form')

      if (!errorMessages[key]) errorMessages[key] = []

      errorMessages[key].push(error.message)
    })

    return errorMessages
  }

  return { zodValueorError }
}
