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
  if (apiRegex.test(cleanedEndpoint)) {
    return cleanedEndpoint
  }

  return 'api/' + cleanedEndpoint
}
