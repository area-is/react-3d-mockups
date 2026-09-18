/**
 * Shared look for the overlay control buttons (zoom, fullscreen) - self-
 * contained, no page CSS. Style objects are camelCased (React `style`
 * compatible); other bindings convert as needed.
 */
export const OVERLAY_BUTTON_STYLE = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.3)',
  background: 'rgba(22,24,29,0.55)',
  color: '#f2f4f8',
  font: '600 18px/1 system-ui, sans-serif',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  userSelect: 'none',
  WebkitBackdropFilter: 'blur(4px)',
  backdropFilter: 'blur(4px)',
  padding: 0,
} as const

/**
 * The zoom control: one pill of three - out, the level, in - rather than a
 * stack of round buttons. The level is a button too: it puts the camera back
 * where it started. Dressed in the same dark glass as the corner button by
 * default, but every colour and the face come from a custom property first
 * (`--mockup-overlay-bg`, `-border`, `-fg`, `-font`), so a page can put the
 * pill in its own chrome without the library shipping a stylesheet.
 */
export const ZOOM_PILL_STYLE = {
  display: 'inline-flex',
  alignItems: 'stretch',
  height: 30,
  borderRadius: 8,
  border: '1px solid var(--mockup-overlay-border, rgba(255,255,255,0.3))',
  background: 'var(--mockup-overlay-bg, rgba(22,24,29,0.55))',
  color: 'var(--mockup-overlay-fg, #f2f4f8)',
  fontFamily: 'var(--mockup-overlay-font, var(--font-mono, ui-monospace, Menlo, monospace))',
  fontSize: 11.5,
  lineHeight: 1,
  overflow: 'hidden',
  userSelect: 'none',
  WebkitBackdropFilter: 'blur(4px)',
  backdropFilter: 'blur(4px)',
} as const

/** One of the pill's three buttons. */
export const ZOOM_PILL_BUTTON_STYLE = {
  border: 0,
  background: 'none',
  color: 'inherit',
  font: 'inherit',
  fontWeight: 600,
  padding: '0 10px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
} as const

/** The middle button: the level, set lighter, in tabular figures, ruled off from the other two. */
export const ZOOM_PILL_LEVEL_STYLE = {
  ...ZOOM_PILL_BUTTON_STYLE,
  minWidth: 52,
  justifyContent: 'center',
  fontWeight: 500,
  fontVariantNumeric: 'tabular-nums',
  opacity: 0.85,
  borderLeft: '1px solid var(--mockup-overlay-border, rgba(255,255,255,0.3))',
  borderRight: '1px solid var(--mockup-overlay-border, rgba(255,255,255,0.3))',
} as const

/** Feather-style corner icons for the fullscreen toggle (16px grid, stroked in currentColor). */
export const OVERLAY_ICON_VIEWBOX = '0 0 24 24'
export const ENTER_FULLSCREEN_ICON_PATH =
  'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3'
export const EXIT_FULLSCREEN_ICON_PATH =
  'M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3'
