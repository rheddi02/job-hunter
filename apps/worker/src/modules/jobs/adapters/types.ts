export class JobSourceError extends Error {
  constructor(message: string, public readonly originalCause?: unknown) {
    super(message)
    this.name = 'JobSourceError'
  }
}
