import type { SVGProps } from 'react'

/**
 * The react-3d-mockups brand mark - the stacked-screens mark from
 * `assets/logo-stack-green.svg`, inlined rather than loaded from `public/` so
 * it paints with the first HTML byte (the site header is sticky, so a late logo
 * is a visible pop) and so its size follows whatever slot it lands in.
 *
 * Three flat screens in the library's own 30-degree isometric projection,
 * stacked and receding into shadow: mockups, plural, layered. The top panel
 * carries the brand green and each panel below it steps one tone darker, so the
 * depth survives being flattened to 16px.
 *
 * The viewBox is cropped to the artwork's own bounds, which are square to
 * within a fifth of a unit, so `size` IS the height you get - no padding baked
 * into the box.
 *
 * The solid mark is used everywhere, including the favicon. The line-only
 * candidates in `assets/logo-candidates/` are not drop-in alternatives: they are
 * stroked, and strokes scale with the viewBox, so they thin out below about
 * 32px - which is smaller than both placements here.
 *
 * Decorative by default: every placement sits next to the "React 3D Mockups"
 * wordmark, so announcing it again would just double up for screen readers.
 * Pass `aria-hidden={false}` with a label if it is ever used on its own.
 *
 * Regenerate from the SVG if the artwork changes - the shapes below are a
 * mechanical transcription of it, nothing else.
 */
export function Logo({ size = 28, ...props }: Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number }) {
  return (
    <svg
      viewBox="46.51 46.51 162.97 162.97"
      width={size}
      height={size}
      aria-hidden
      focusable="false"
      {...props}
    >
      <g transform="matrix(0.866025 0.5 0.866025 -0.5 40.53 145)">
        <path d="M 3.51 3.51 A 12 12 0 0 1 12 0 L 106 0 A 12 12 0 0 1 118 12 L 118 72 A 12 12 0 0 1 114.49 80.49 L 123.49 71.49 A 12 12 0 0 0 127 63 L 127 3 A 12 12 0 0 0 115 -9 L 21 -9 A 12 12 0 0 0 12.51 -5.49 Z" fill="#1E5A32" />
        <path d="M 12 0 L 106 0 A 12 12 0 0 1 118 12 L 118 72 A 12 12 0 0 1 106 84 L 12 84 A 12 12 0 0 1 0 72 L 0 12 A 12 12 0 0 1 12 0 Z" fill="#276D3E" />
      </g>
      <g transform="matrix(0.866025 0.5 0.866025 -0.5 40.53 115)">
        <path d="M 3.51 3.51 A 12 12 0 0 1 12 0 L 106 0 A 12 12 0 0 1 118 12 L 118 72 A 12 12 0 0 1 114.49 80.49 L 123.49 71.49 A 12 12 0 0 0 127 63 L 127 3 A 12 12 0 0 0 115 -9 L 21 -9 A 12 12 0 0 0 12.51 -5.49 Z" fill="#1E5A32" />
        <path d="M 12 0 L 106 0 A 12 12 0 0 1 118 12 L 118 72 A 12 12 0 0 1 106 84 L 12 84 A 12 12 0 0 1 0 72 L 0 12 A 12 12 0 0 1 12 0 Z" fill="#2D9F4F" />
      </g>
      <g transform="matrix(0.866025 0.5 0.866025 -0.5 40.53 85)">
        <path d="M 3.51 3.51 A 12 12 0 0 1 12 0 L 106 0 A 12 12 0 0 1 118 12 L 118 72 A 12 12 0 0 1 114.49 80.49 L 123.49 71.49 A 12 12 0 0 0 127 63 L 127 3 A 12 12 0 0 0 115 -9 L 21 -9 A 12 12 0 0 0 12.51 -5.49 Z" fill="#276D3E" />
        <path d="M 12 0 L 106 0 A 12 12 0 0 1 118 12 L 118 72 A 12 12 0 0 1 106 84 L 12 84 A 12 12 0 0 1 0 72 L 0 12 A 12 12 0 0 1 12 0 Z" fill="#31D322" />
      </g>
    </svg>
  )
}
