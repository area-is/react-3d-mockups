'use client'

import { Float } from '@react-three/drei'
import { AppleWatch, IPhone, Laptop, MockupCanvas } from 'react-3d-mockups'
import { useNarrow } from '../_shared/use-narrow'
import { Dashboard, INK, MobileApp, WatchFace, type LedgerState } from './ledger-screens'

/**
 * The hero: three devices in ONE canvas.
 *
 * Each `*Mockup` is a canvas with an object in it, which is right for a page
 * that shows one device and wrong for a hero that shows an app across
 * three - three contexts to hold, three orbits that do not agree, three
 * contact shadows on three floors. So this composes the bare objects
 * (`<Laptop>`, `<IPhone>`, `<AppleWatch>`) into a single `<MockupCanvas>`,
 * posed in one space with one camera, one light rig and one shadow plane.
 * A drag orbits the whole arrangement.
 *
 * The devices are not modelled to one common scale across families - each
 * is sized to fill its own stage - so the phone and the watch are scaled
 * down here to read as a phone and a watch beside a laptop. Each object
 * floats on its own `<Float>`, out of phase with the others, which is what
 * makes the group read as three things rather than one rigid prop.
 */
export default function LedgerScene({ state }: { state: LedgerState }) {
  // The arrangement is about 7 units wide. Close enough to fill a desktop
  // stage with it; further back on a phone, where the same pose would crop
  // the watch and the phone at the canvas edges.
  const narrow = useNarrow()
  return (
    <MockupCanvas camera={{ position: [0, 0.55, narrow ? 11 : 7.7], fov: 38 }} shadowY={-1.75}>
      <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.25}>
        <Laptop variant="pro14" color="#2c2e33" position={[0, -0.5, -0.4]} rotation={[0, -0.16, 0]} surfaceBackground={INK}>
          <Dashboard state={state} />
        </Laptop>
      </Float>
      <Float speed={1.4} rotationIntensity={0.12} floatIntensity={0.35}>
        <IPhone variant="pro" color="deepblue" statusBar position={[2.5, -0.95, 1.55]} rotation={[0, -0.34, 0]} scale={0.55} surfaceBackground={INK}>
          <MobileApp state={state} />
        </IPhone>
      </Float>
      <Float speed={1.25} rotationIntensity={0.1} floatIntensity={0.3}>
        <AppleWatch color="jetblack" bandColor="#1d2028" position={[-2.45, -0.8, 1.35]} rotation={[0, 0.42, 0]} scale={0.44} surfaceBackground="#000">
          <WatchFace state={state} />
        </AppleWatch>
      </Float>
    </MockupCanvas>
  )
}
