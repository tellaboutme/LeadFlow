import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/react'
import { afterAll, afterEach } from 'vitest'
import { server } from '@/mocks/server'
import { resetLeadStore, resetSettingsStore } from '@/mocks/handlers'

// The default 1000ms is too tight when the full suite runs under heavy
// parallel load (many files, plus Storybook's Playwright-backed browser
// tests, competing for CPU): findBy/waitFor calls can occasionally exceed it
// even though the underlying logic resolves quickly in isolation.
configure({ asyncUtilTimeout: 10_000 })

// jsdom has no ResizeObserver; Radix primitives (Select, etc.) need one, and
// Recharts' ResponsiveContainer uses one to size its SVG (jsdom's own
// offsetWidth/offsetHeight are always 0, so it needs a real callback with a
// non-zero contentRect or it never renders any chart marks at all).
class ResizeObserverStub {
  #callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.#callback = callback
  }
  observe(target: Element) {
    const rect = { width: 600, height: 400, top: 0, left: 0, bottom: 400, right: 600, x: 0, y: 0 }
    const entry = { target, contentRect: rect } as ResizeObserverEntry
    queueMicrotask(() => this.#callback([entry], this as unknown as ResizeObserver))
  }
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver

// Radix Select also relies on scrollIntoView and pointer capture APIs, which
// jsdom doesn't implement.
Element.prototype.scrollIntoView ??= () => {}
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.setPointerCapture ??= () => {}
Element.prototype.releasePointerCapture ??= () => {}

// jsdom does no layout, so offsetWidth/offsetHeight are always 0. Recharts'
// ResponsiveContainer waits for a non-zero measured size before rendering its
// SVG at all, so without this stub no chart ever renders any marks in tests.
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 600 })
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 400 })

// jsdom has no object URL support; CSV export downloads need a stub so
// URL.createObjectURL/revokeObjectURL don't throw when a Blob is downloaded.
URL.createObjectURL ??= () => 'blob:mock'
URL.revokeObjectURL ??= () => {}

// Must run synchronously here (not inside beforeAll) so the fetch patch is in
// place before any module creates its API client and captures globalThis.fetch.
server.listen({ onUnhandledRequest: 'error' })
afterEach(() => {
  server.resetHandlers()
  resetLeadStore()
  resetSettingsStore()
})
afterAll(() => server.close())
