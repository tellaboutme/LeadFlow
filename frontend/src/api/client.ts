import createClient, { type Middleware } from 'openapi-fetch'
import type { paths } from './schema'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const DEFAULT_TIMEOUT_MS = 10_000
const REQUEST_ID_HEADER = 'X-Request-ID'

export class ApiError extends Error {
  readonly status: number
  readonly requestId: string | null
  readonly detail: unknown

  constructor(status: number, detail: unknown, requestId: string | null) {
    super(typeof detail === 'string' ? detail : `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.requestId = requestId
    this.detail = detail
  }
}

export class ApiTimeoutError extends Error {
  constructor() {
    super(`Request timed out after ${DEFAULT_TIMEOUT_MS}ms`)
    this.name = 'ApiTimeoutError'
  }
}

const timeoutMiddleware: Middleware = {
  async onRequest({ request }) {
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(DEFAULT_TIMEOUT_MS)])
    return new Request(request, { signal })
  },
}

const throwOnErrorMiddleware: Middleware = {
  async onResponse({ response }) {
    if (response.ok) return response
    const requestId = response.headers.get(REQUEST_ID_HEADER)
    let detail: unknown
    try {
      const body = await response.clone().json()
      detail = body?.detail ?? body
    } catch {
      detail = await response.clone().text()
    }
    throw new ApiError(response.status, detail, requestId)
  },
  onError({ error }) {
    if (error instanceof DOMException && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      return new ApiTimeoutError()
    }
    throw error
  },
}

export const api = createClient<paths>({ baseUrl: API_BASE_URL })
api.use(timeoutMiddleware)
api.use(throwOnErrorMiddleware)
