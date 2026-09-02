import { describe, expect, it } from 'vitest'
import {
  MILK_CARTON_HEIGHT,
  MILK_CARTON_METRICS,
  milkCartonLayout,
  milkCartonRoof,
} from '../objects/milk-carton/dimensions'

/**
 * The carton's live panels are the flats of its faces, and the roof's flat is
 * defined by the same profile the model lofts the board from - so these check
 * that the printable areas the metrics report really are the board's flats.
 */
describe('milkCartonLayout', () => {
  it('keeps the overall height whatever the fillet does to the slope', () => {
    const { body, gable, fin } = milkCartonLayout()
    expect(body.height + gable.rise + fin.height).toBeCloseTo(MILK_CARTON_HEIGHT, 6)
  })

  it('reports each wall face as the flat between its corner folds', () => {
    const { body } = milkCartonLayout()
    expect(body.face.width).toBeCloseTo(body.width - 2 * body.radius, 6)
    expect(body.face.depth).toBeCloseTo(body.depth - 2 * body.radius, 6)
    expect(body.face.width).toBeLessThan(body.width)
  })

  it('never folds a corner wider than a small carton has face for', () => {
    const { body } = milkCartonLayout({ width: 12, height: 241, depth: 12 })
    expect(body.radius).toBeLessThanOrEqual(body.width / 4)
    expect(body.face.width).toBeGreaterThan(0)
  })
})

describe('milkCartonRoof', () => {
  const { body, gable } = milkCartonLayout()
  const roof = milkCartonRoof(body, gable)
  const hd = body.depth / 2

  it('is tangent to the wall at the eave and to the slope where the fillet ends', () => {
    // Flush with the eave at the outer edge, on the arc just inside it.
    expect(roof.heightAt(hd)).toBeCloseTo(0, 6)
    expect(roof.heightAt(hd - roof.fold * 0.5)).toBeGreaterThan(0)
    // Continuous where the arc hands over to the straight slope.
    const e = 1e-6
    expect(roof.heightAt(roof.filletEndZ - e)).toBeCloseTo(roof.heightAt(roof.filletEndZ + e), 4)
  })

  it('runs the slope up to a flat the fin stands on, symmetric front to back', () => {
    expect(roof.heightAt(gable.crease)).toBeCloseTo(roof.apex, 6)
    expect(roof.heightAt(0)).toBeCloseTo(roof.apex, 6)
    expect(roof.heightAt(-0.4)).toBeCloseTo(roof.heightAt(0.4), 6)
    // The fillet lifts the ridge a hair over where a sharp crease would put it.
    expect(roof.apex).toBeGreaterThan(gable.rise - gable.crease * roof.pitch - 1e-6)
  })

  it('places the printable run on the straight part of the slope, inside the fillet and the flat', () => {
    const { panel } = roof
    const halfRun = panel.length / 2 / roof.along
    expect(panel.centerZ - halfRun).toBeCloseTo(gable.crease, 6)
    expect(panel.centerZ + halfRun).toBeCloseTo(roof.filletEndZ, 6)
    // Its centre sits on the board.
    expect(panel.centerY).toBeCloseTo(roof.heightAt(panel.centerZ), 6)
    // Shorter than the whole slant, which includes the fillet and the flat.
    expect(panel.length).toBeLessThan(gable.slant)
    expect(panel.length).toBeGreaterThan(gable.slant * 0.8)
  })

  it('is what the metrics report for the roof panels', () => {
    const regions = MILK_CARTON_METRICS.regions({})
    expect(regions.gableFront.height).toBeCloseTo(roof.panel.length, 6)
    expect(regions.gableFront.width).toBeCloseTo(body.width, 6)
    expect(regions.front.width).toBeCloseTo(body.face.width, 6)
    expect(regions.front.radius).toBe(0)
  })
})
