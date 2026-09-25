/**
 * The carousel's gesture hint, worded for a finger and for a mouse; the
 * stylesheet shows the one that matches the input (`.carousel-hint-touch`).
 *
 * Shared by the carousel and its server-rendered placeholder, because the
 * placeholder holds the carousel's height with the same text: a hint worded
 * differently in one of them could wrap differently and move the page when
 * the scene replaces it.
 */
export function CarouselHintText() {
  return (
    <>
      <span className="carousel-hint-pointer">Drag to spin · drag the sides to browse</span>
      <span className="carousel-hint-touch">Drag to spin · swipe to browse</span>
    </>
  )
}
