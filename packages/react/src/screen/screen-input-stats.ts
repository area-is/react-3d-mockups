/**
 * EXPERIMENTAL: running totals for `experimentalScreenInput`, so a test page
 * can show what the per-frame readback and tracing cost on the machine it
 * runs on. Reset it by assigning zeros.
 *
 * A module of its own so it can be read without loading the screen-input
 * code, which only arrives once a screen takes input.
 */
export const experimental_screenInputStats = { frames: 0, readMs: 0, traceMs: 0, pixels: 0, vertices: 0 }
