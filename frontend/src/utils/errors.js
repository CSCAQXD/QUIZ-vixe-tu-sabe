export class UserFacingError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = 'UserFacingError'
    this.code = details.code
    this.requestId = details.requestId
    this.status = details.status
  }
}

const TECHNICAL_MESSAGE_PATTERNS = [
  /cannot (?:read|set) properties/i,
  /(?:type|reference|syntax|range)error/i,
  /is not a function/i,
  /failed to fetch/i,
  /networkerror/i,
  /unexpected token/i,
  /\bat\s+\S+\s+\([^)]*:\d+:\d+\)/i,
]

export function getUserErrorMessage(error, fallback) {
  const message = error instanceof Error ? error.message.trim() : ''
  const exposesTechnicalDetails = TECHNICAL_MESSAGE_PATTERNS.some((pattern) =>
    pattern.test(message),
  )

  if (message && message.length <= 300 && !exposesTechnicalDetails) return message

  return fallback
}
