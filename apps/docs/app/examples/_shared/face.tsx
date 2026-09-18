'use client'

import type { CSSProperties, ReactNode } from 'react'
import { FONT } from '@/components/screens/swiss-art'

/**
 * A live surface, ready to lay out in container units.
 *
 * Two elements on purpose. Container-relative units resolve against the
 * nearest ANCESTOR container, never the element that declares the
 * container, so `padding: 6cqw` set on the container root falls back to
 * the viewport and comes out as six per cent of the browser window. The
 * outer div is the query container; the inner one lays out in the units
 * the outer defines. Every example surface that measures itself in `cqw`
 * or `cqh` starts here.
 */
export function Face({
  background,
  color,
  style,
  children,
}: {
  background?: string
  color?: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <div style={{ width: '100%', height: '100%', containerType: 'size', background, overflow: 'hidden', position: 'relative' }}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          color,
          fontFamily: FONT,
          userSelect: 'none',
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  )
}
