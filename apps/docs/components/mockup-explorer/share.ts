/**
 * Share links: the explorer's props, carried in the URL hash so a link opens
 * the page with the explorer already set the way the sender had it.
 *
 * The hash is `#play-<id>=<payload>`. `<id>` says which explorer on the page
 * the link is for - a device page carries the main one, the chroma view and
 * a handful of "More examples", and each can be shared. It is a digest of how
 * the page configures that explorer rather than its position, so a link still
 * lands on the right example after the page gains a section above it. The
 * payload is base64url JSON of only what differs from where that explorer
 * opens, and is left off entirely when nothing does: `#play-<id>` alone is a
 * link to the example as it stands.
 *
 * Nothing on the page has an id starting `play-`, so the browser's own
 * fragment scroll finds nothing to fight over, and every other hash - the
 * heading anchors above all - is left to the page.
 */

const PREFIX = 'play-'
const HASH = /^#play-([0-9a-z]+)(?:=([\w-]*))?$/

/**
 * A short, stable id for one explorer, from the props the page gives it.
 *
 * FNV-1a over the JSON: not a security boundary, just enough spread that two
 * explorers on one page never share an id - and the content has none that
 * are configured identically.
 */
export function explorerId(config: Record<string, unknown>): string {
  const text = JSON.stringify(config)
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36)
}

const encode = (value: unknown): string => {
  let binary = ''
  for (const byte of new TextEncoder().encode(JSON.stringify(value))) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const decode = (text: string): unknown => {
  // `atob` takes base64 with its padding dropped, so only the alphabet needs
  // mapping back. `fatal` makes a mangled payload throw rather than decode to
  // replacement characters that happen to parse.
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
}

/**
 * The changes a link carries for this explorer: an object (empty for a bare
 * `#play-<id>`), or `null` when the hash is not a link to it at all. A hash
 * that is ours but will not decode is `null` too - a truncated paste is
 * nobody's emergency, and the page opens as if there were no hash.
 */
export function readShared(id: string): Record<string, unknown> | null {
  const match = HASH.exec(window.location.hash)
  if (!match || match[1] !== id) return null
  if (!match[2]) return {}
  try {
    const value = decode(match[2])
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

/**
 * Puts the link for this explorer in the address bar, and returns it.
 *
 * `replaceState` rather than assigning `location.hash`: a new history entry
 * per click would make Back step through every share, and a hash assignment
 * fires `hashchange`, which every explorer listens to in order to follow a
 * pasted link - including this one, which would restore what it is already
 * showing and scroll the page onto itself.
 */
export function writeShared(id: string, changes: Record<string, unknown>): string {
  const { origin, pathname, search } = window.location
  const payload = Object.keys(changes).length ? `=${encode(changes)}` : ''
  const url = `${origin}${pathname}${search}#${PREFIX}${id}${payload}`
  window.history.replaceState(null, '', url)
  return url
}

/**
 * Put `text` on the clipboard, reporting whether it got there.
 *
 * The async Clipboard API is the real path; the textarea-and-`execCommand`
 * one is for where it is missing or refused (a non-secure origin such as a
 * LAN preview, an embedding that denies the permission). The same fallback
 * as the site's `CopyButton`, which keeps its copy private to the component.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    try {
      return document.execCommand('copy')
    } catch {
      return false
    } finally {
      area.remove()
    }
  }
}
