type queryParamValue = string | boolean | Date | null | number

export const createQueryParams = (params: Record<string, queryParamValue>) => {
  const queryParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return

    queryParams.append(key, String(value))
  })

  return queryParams
}
