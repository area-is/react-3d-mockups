'use client'

import { useEffect, useState } from 'react'

/**
 * Whether the viewport is a phone's, for a scene whose camera is chosen for
 * a wide box. A pose that fills a desktop stage crops at both edges of a
 * phone-width one, so such scenes fall back to a wider camera there.
 * `false` on the server and on the first client render; the scenes that
 * read it are dynamic imports with SSR off, so nothing hydrates against it.
 */
export function useNarrow(query = '(max-width: 760px)'): boolean {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const sync = () => setNarrow(mql.matches)
    sync()
    mql.addEventListener('change', sync)
    return () => mql.removeEventListener('change', sync)
  }, [query])
  return narrow
}
