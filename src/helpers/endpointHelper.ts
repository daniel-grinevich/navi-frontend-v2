export const cleanEndpoint = (endpoint: string) => {
  if (endpoint.length < 3) {
    throw new Error('Endpoint cannot be smaller than 3 characters.')
  }

  let cleanedEndpoint = ''

  const frontSlashRegex = /^\//
  cleanedEndpoint = endpoint.replace(frontSlashRegex, '')

  const backSlashRegex = /\/$/
  if (!backSlashRegex.test(cleanedEndpoint)) {
    cleanedEndpoint = cleanedEndpoint + '/'
  }

  const apiRegex = /^api/
  cleanedEndpoint = cleanedEndpoint.replace(apiRegex, '')
  cleanedEndpoint = cleanedEndpoint.replace(frontSlashRegex, '')

  return cleanedEndpoint
}
