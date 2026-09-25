import Link from 'next/link'

/**
 * The notice every device page carries.
 *
 * The device mockups are procedural models built from published specifications
 * and product photography - close enough to sell a design, never a CAD file -
 * and they render marks their manufacturers own. Saying both, on the page where
 * someone decides to ship a render, is cheaper than saying it once in a
 * LICENSE nobody opens. The same wording is the provenance statement every
 * device page makes, so the two cannot drift apart; the longer version is
 * content/docs/trademarks.mdx.
 *
 * Objects (a book, a bus, a billboard) carry no third-party marks and are not
 * anyone's product, so they do not get this - except the TV, whose designs
 * follow real Samsung and LG sets and whose picture-frame back carries a
 * Samsung print.
 */
export function DeviceDisclaimer({ brands }: { brands?: string }) {
  return (
    <aside className="device-disclaimer">
      <p>
        <strong>Not an official product model.</strong> This mockup is an
        independent, procedurally generated approximation built from published
        specifications and product photography. It is close enough for design
        work, but it is <em>not</em> dimensionally exact, not a CAD model, and
        not affiliated with, endorsed by, or sponsored by
        {brands ? ` ${brands}` : ' the manufacturer'}.
      </p>
      <p>
        All product names, logos, trademarks and device designs are the property
        of their respective owners and are referenced here for identification
        only. You are responsible for how you use a render - check the relevant
        trademark and design-rights guidelines before publishing, and take extra
        care with anything that could imply an endorsement. See{' '}
        {/* next/link, not <a>: it is what adds the site's basePath. */}
        <Link href="/docs/trademarks">Trademarks and usage</Link>.
      </p>
    </aside>
  )
}
