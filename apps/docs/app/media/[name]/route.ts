import { getCloudflareContext } from '@opennextjs/cloudflare'

/**
 * Media served from R2 rather than from the site's static assets - today the
 * promo film on the home page (`/media/react-3d-mockups.mp4`).
 *
 * Workers static assets answer a `Range` request with the whole file, and
 * Safari will not play a video from a server that does: it asks for the
 * first two bytes and gives up when it gets eleven megabytes. R2 hands back
 * the bytes asked for, so here the film plays as it downloads and seeks, on
 * every browser. The files live in the `react-3d-mockups-media` bucket (the
 * `MEDIA` binding in `wrangler.jsonc`); `examples/remotion/README.md` says
 * how the film gets there.
 *
 * Outside a Worker - `next start`, or `next dev` with its local, empty R2 -
 * there is nothing to serve, and every name is a 404.
 */

/** The slice of the R2 binding's API this route uses. */
interface MediaObject {
  size: number
  httpEtag: string
  range?: { offset?: number; length?: number; suffix?: number }
  writeHttpMetadata(headers: Headers): void
  body?: ReadableStream
}
interface MediaBucket {
  get(key: string, options: { range: Headers; onlyIf: Headers }): Promise<MediaObject | null>
}

/** A file name, nothing that could reach outside the bucket's top level. */
const NAME = /^[\w-]+(\.[\w-]+)*$/

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  if (!NAME.test(name)) return new Response('Not found', { status: 404 })
  let bucket: MediaBucket | undefined
  try {
    bucket = ((await getCloudflareContext({ async: true })).env as { MEDIA?: MediaBucket }).MEDIA
  } catch {
    bucket = undefined
  }
  if (!bucket) return new Response('Not found', { status: 404 })

  // R2 reads the Range and the conditional headers straight off the request.
  const object = await bucket.get(name, { range: request.headers, onlyIf: request.headers })
  if (!object) return new Response('Not found', { status: 404 })

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('accept-ranges', 'bytes')
  if (!headers.has('cache-control')) headers.set('cache-control', 'public, max-age=86400')

  // A precondition that failed comes back without a body.
  if (!object.body) return new Response(null, { status: request.headers.has('if-none-match') ? 304 : 412, headers })

  const range = object.range
  if (range && request.headers.has('range')) {
    const offset = range.suffix !== undefined ? object.size - range.suffix : (range.offset ?? 0)
    const length = range.suffix !== undefined ? range.suffix : (range.length ?? object.size - offset)
    headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${object.size}`)
    headers.set('content-length', String(length))
    return new Response(object.body, { status: 206, headers })
  }
  headers.set('content-length', String(object.size))
  return new Response(object.body, { headers })
}
