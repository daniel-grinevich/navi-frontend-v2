export default class ApiError extends Error {
  status: number | null

  constructor(status: number | null, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}
