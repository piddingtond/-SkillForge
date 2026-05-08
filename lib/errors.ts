const isProd = process.env.NODE_ENV === 'production'

export function sanitizeError(error: unknown): string {
  if (!isProd) {
    if (error instanceof Error) return error.message
    return String(error)
  }
  return 'An internal error occurred. Please try again.'
}
