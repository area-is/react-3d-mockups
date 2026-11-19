/**
 * Ledger's mark: a circle split across the middle and held by a disc at its
 * centre, two halves kept in balance. Generated with GPT Image 2.6
 * (`gpt-image-2.6-sunburst`, quality "low", background "transparent", SVG
 * output authored by `gpt-6.1-sol`) and kept as the shapes it returned, with
 * the ids dropped (the mark is drawn more than once on a page) and the viewBox
 * trimmed to the circle. It fills with `currentColor`, so the page's lime and
 * the screens' lime both come from where it sits.
 */
export function LedgerMark({ size = 16, className, color }: { size?: number; className?: string; color?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="72 72 880 880" fill={color ?? 'currentColor'} aria-hidden focusable="false">
      <path d="M79.334 432A440 440 0 0 1 944.666 432Z" />
      <path d="M79.334 592H944.666A440 440 0 0 1 79.334 592Z" />
      <circle cx="512" cy="512" r="192" />
    </svg>
  )
}
