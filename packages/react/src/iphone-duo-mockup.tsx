import { IPHONE_DUO_FRAMING, SCREEN_REGIONS, IPHONE_DUO_METRICS } from './core'
import { createMockup, type MockupProps } from './create-mockup'
import { IPhoneDuo, foldSlots, type IPhoneDuoProps } from './devices/fold/fold'

export type IPhoneDuoMockupProps = MockupProps<IPhoneDuoProps>

/**
 * The one-liner: a complete, interactive 3D iPhone Duo mockup. Open by
 * default - your content fills the landscape 7.6" inner display, which has
 * no camera hole to design around.
 *
 * ```tsx
 * <IPhoneDuoMockup autoRotate float>
 *   <YourApp />
 * </IPhoneDuoMockup>
 *
 * <IPhoneDuoMockup openAngle={false}>
 *   <CoverUI /> {/* folded: content on the 5.4" cover screen *\/}
 * </IPhoneDuoMockup>
 * ```
 *
 * Wrap children in `<IPhoneDuoMockup.Screen>` to set per-screen surface props:
 *
 * ```tsx
 * <IPhoneDuoMockup openAngle={110} color="nightsky">
 *   <IPhoneDuoMockup.Screen surfaceBackground="#000" resolution={1024}>
 *     <YourApp />
 *   </IPhoneDuoMockup.Screen>
 * </IPhoneDuoMockup>
 * ```
 */
export const IPhoneDuoMockup = createMockup({
  kind: 'iphoneDuo',
  regions: SCREEN_REGIONS,
  metrics: IPHONE_DUO_METRICS,
  object: IPhoneDuo,
  framing: IPHONE_DUO_FRAMING,
  slots: foldSlots,
  displayName: 'IPhoneDuoMockup',
})
