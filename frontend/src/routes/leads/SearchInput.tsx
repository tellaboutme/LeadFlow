import { useEffect, useRef, useState } from 'react'
import { LoaderCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

const DEBOUNCE_MS = 200

export function SearchInput({
  value,
  onDebouncedChange,
  isFetching = false,
}: {
  value: string
  onDebouncedChange: (value: string) => void
  isFetching?: boolean
}) {
  const [local, setLocal] = useState(value)
  const [debouncing, setDebouncing] = useState(false)
  const onChangeRef = useRef(onDebouncedChange)
  onChangeRef.current = onDebouncedChange

  // Keep the input in sync when the URL-backed value changes externally
  // (e.g. clearing filters), without fighting the user's own typing.
  useEffect(() => {
    setLocal(value)
  }, [value])

  useEffect(() => {
    if (local === value) return
    setDebouncing(true)
    const timer = setTimeout(() => {
      setDebouncing(false)
      onChangeRef.current(local)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [local, value])

  const showSpinner = debouncing || isFetching

  return (
    <div className="relative w-full sm:max-w-xs">
      {showSpinner ? (
        <LoaderCircle
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
          aria-hidden
        />
      ) : (
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      )}
      <Input
        type="search"
        placeholder="Search name, email, company"
        aria-label="Search leads"
        className="pl-8"
        value={local}
        onChange={(event) => setLocal(event.target.value)}
      />
    </div>
  )
}
