'use client'

import type { CSSProperties } from 'react'
import { ortho } from 'tabbied/patterns'
import { Pattern, materialTone } from '@/components/screens/swiss-art'
import { SERIF } from '@/components/screens/label-art'
import { Face } from '../_shared/face'
import { CUSTOMER, STOCKS, find, type Spec } from './packaging-data'

/**
 * The customer's artwork, printed on whatever box they configure.
 *
 * Every face is transparent - the box's own stock shows through, painted
 * as the surface background - and the ink is chosen from the stock the way
 * a printer chooses it: dark on kraft and white board, light on black
 * (`materialTone`, the same rule the site's carousel uses). The all-over
 * print is `ortho` from Tabbied, squares on a grid in that one ink, which
 * is what a one-colour flexo plate on corrugated actually looks like.
 */

const WORDMARK: CSSProperties = { fontFamily: SERIF, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 0.9 }

/** The ink for the spec's stock. */
export function inkFor(spec: Spec): string {
  return materialTone(find(STOCKS, spec.stock).color).text
}

/** A face of the box. `main` faces carry the name; the others only the mark. */
export function BoxFace({ spec, main, seed }: { spec: Spec; main?: boolean; seed: string }) {
  const ink = inkFor(spec)
  const stock = find(STOCKS, spec.stock).color
  if (spec.print === 'none') return <Face background="transparent">{null}</Face>
  return (
    <Face background="transparent" color={ink} style={{ display: 'flex', flexDirection: 'column', padding: '7cqmin', gap: '3cqmin' }}>
      {spec.print === 'pattern' ? (
        <div style={{ flex: 1, minHeight: 0, position: 'relative', opacity: 0.9 }}>
          <Pattern pattern={ortho} seed={seed} palette={['transparent', ink]} grid={main ? '4x6' : '2x3'} />
        </div>
      ) : (
        <div style={{ flex: 1 }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '3cqmin' }}>
        <span style={{ ...WORDMARK, fontSize: main ? '14cqmin' : '9cqmin' }}>{CUSTOMER.name}</span>
        {main ? (
          <span style={{ fontSize: '3.6cqmin', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3, textAlign: 'right', opacity: 0.8 }}>
            {CUSTOMER.line}
            <br />
            {CUSTOMER.url}
          </span>
        ) : null}
      </div>
      {/* the stock, named on the print the way a mill stamps board */}
      {main ? (
        <span style={{ position: 'absolute', right: '7cqmin', top: '7cqmin', fontSize: '3cqmin', fontWeight: 600, opacity: 0.55 }}>
          {find(STOCKS, spec.stock).label} · {stock === '#1c1b1b' ? 'white ink' : 'black ink'}
        </span>
      ) : null}
    </Face>
  )
}

/** The counter display board: the same artwork on a rigid panel. */
export function PanelFace({ spec }: { spec: Spec }) {
  const ink = inkFor(spec)
  return (
    <Face background="transparent" color={ink} style={{ display: 'flex', flexDirection: 'column', padding: '6cqmin', gap: '3cqmin' }}>
      <div style={{ flex: 1, minHeight: 0, position: 'relative', opacity: 0.9 }}>
        <Pattern pattern={ortho} seed="ochre-panel" palette={['transparent', ink]} grid="6x9" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ ...WORDMARK, fontSize: '13cqmin' }}>{CUSTOMER.name}</span>
        <span style={{ fontSize: '3.6cqmin', fontWeight: 600, opacity: 0.8 }}>New for autumn · {CUSTOMER.line}</span>
      </div>
    </Face>
  )
}
