import * as React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { A_FRAME_SIGN, A_FRAME_SIGN_REGIONS, WOOD, grainNormal, grainTint, roundedRectShape } from '../../core'
import { DeviceScreen } from '../../screen/device-screen'
import { collectSlots, createSlots, resolveSurface, type SurfaceProps } from '../../slots'

type GroupProps = ThreeElements['group']

export interface AFrameSignProps extends Omit<GroupProps, 'children' | 'color'>, SurfaceProps {
  /**
   * Panel content. Bare children fill the front panel; name panels explicitly
   * with `<AFrameSign.Front>` and `<AFrameSign.Back>`.
   */
  children?: React.ReactNode
  /** Frame color - classic dark-stained wood by default. */
  color?: string
}

/**
 * A procedurally built sidewalk A-frame sandwich board: two mortise-and-tenon
 * wood-framed 600 x 900 mm panels with continuous timber stiles on rubber-tipped
 * feet and horizontal-grain rails, joined by leaf hinges at the crown and
 * articulated folding metal stay arms at mid-height - both sides live DOM:
 * chalk menus, sale boards, open/closed signs. No 3D asset files are loaded.
 *
 * The origin is mid-height between the panels; the pavement sits at the leg
 * bottoms. Must be rendered inside a react-three-fiber `<Canvas>` (or
 * `<MockupCanvas>`).
 *
 * ```tsx
 * <AFrameSign>
 *   <AFrameSign.Front><MenuBoard /></AFrameSign.Front>
 *   <AFrameSign.Back><HoursBoard /></AFrameSign.Back>
 * </AFrameSign>
 * ```
 */
function AFrameSignImpl({
  children,
  color = '#4a3826',
  surfaceBackground = '#20241f',
  resolution = A_FRAME_SIGN.resolution,
  surfaceStyle,
  ...groupProps
}: AFrameSignProps) {
  const regions = collectSlots(children, A_FRAME_SIGN_REGIONS)
  const { panel, face, splayAngle } = A_FRAME_SIGN

  const boardGeometry = React.useMemo(
    () => new THREE.ShapeGeometry(roundedRectShape(face.width + 0.08, face.height + 0.08, face.radius), 8),
    [face]
  )
  React.useEffect(() => () => boardGeometry.dispose(), [boardGeometry])

  const tilt = (splayAngle * Math.PI) / 180
  // hinge at the top: panels pivot about their top edge
  const topY = (panel.height / 2) * Math.cos(tilt)
  // the frame stiles run ~40 mm past the panel bottom so the board stands on
  // four rubber-tipped leg feet; lifting the whole sign keeps the feet on the
  // original pavement line
  const legDrop = 0.143
  const legLift = legDrop * Math.cos(tilt)
  const footPadH = 0.032

  // 4-piece timber joinery dimensions: continuous vertical stiles (top to foot)
  // with horizontal rails fitted cleanly between them so grain runs along every
  // member with zero cross-grain stripes and zero horizontal leg-joint seam.
  const stileW = (panel.width - face.width) / 2
  const stileX = face.width / 2 + stileW / 2
  const stileH = panel.height + legDrop - footPadH
  const stileCenterY = (panel.height / 2 + (-panel.height / 2 - legDrop + footPadH)) / 2
  const railH = (panel.height - face.height) / 2
  const railY = face.height / 2 + railH / 2
  const railW = face.width + 0.016

  // Articulated folding scissor-stay geometry spanning the inner stiles at mid-height.
  const stayHalfSpan = (panel.height / 2) * Math.sin(tilt) - panel.frameDepth * 0.35
  const stayKneeLift = 0.065
  const stayArmLen = Math.hypot(stayHalfSpan, stayKneeLift)
  const stayArmAngle = Math.atan2(stayKneeLift, stayHalfSpan)

  const surfaceDefaults = {
    surfaceBackground,
    resolution,
    surfaceStyle,
  }
  const screenProps = {
    width: face.width,
    height: face.height,
    radius: face.radius,
  }

  // Stained timber: grain runs along each member's length (vertical on stiles,
  // horizontal on rails); pale `color` reads as paint (relief only, no tint).
  const timber = (width: number, height: number, horizontal = false) => {
    const rx = horizontal ? height * 2.2 : width * 2.2
    const ry = horizontal ? width * 0.55 : height * 0.55
    return (
      <meshPhysicalMaterial
        color={color}
        metalness={0}
        roughness={0.72}
        map={grainTint(WOOD, color, rx, ry, horizontal)}
        normalMap={grainNormal(WOOD, rx, ry, horizontal)}
        normalScale={0.55}
      />
    )
  }

  const hardware = { color: '#9ea3ab', metalness: 0.86, roughness: 0.3 }
  const darkMetal = { color: '#2b2e33', metalness: 0.72, roughness: 0.4 }
  const rubberFoot = { color: '#1b1d20', metalness: 0, roughness: 0.92 }

  return (
    <group {...groupProps}>
      {([-1, 1] as const).map((dir) => {
        // dir -1 leans toward the viewer (the front face); tops meet at the
        // hinge and bottoms splay apart into the A stance
        const isFront = dir === -1
        const slot = isFront ? regions.front : regions.back
        return (
          <group
            key={dir}
            position={[0, legLift, -dir * (panel.height / 2) * Math.sin(tilt)]}
            rotation-x={dir * tilt}
          >
            {/* continuous left and right vertical stiles running seamlessly into the feet */}
            {([1, -1] as const).map((side) => (
              <group key={side} position-x={side * stileX}>
                <RoundedBox
                  args={[stileW, stileH, panel.frameDepth]}
                  radius={0.015}
                  position-y={stileCenterY}
                >
                  {timber(stileW, stileH, false)}
                </RoundedBox>
                {/* non-slip rubber foot cap at the bottom of each leg */}
                <RoundedBox
                  args={[stileW + 0.008, footPadH, panel.frameDepth + 0.008]}
                  radius={0.008}
                  position-y={-panel.height / 2 - legDrop + footPadH / 2}
                >
                  <meshPhysicalMaterial {...rubberFoot} />
                </RoundedBox>
              </group>
            ))}

            {/* horizontal top and bottom rails with true horizontal wood grain */}
            {([1, -1] as const).map((v) => (
              <RoundedBox
                key={v}
                args={[railW, railH, panel.frameDepth]}
                radius={0.014}
                position={[0, v * railY, 0]}
              >
                {timber(railW, railH, true)}
              </RoundedBox>
            ))}

            {/*
              Board behind the opening. DOUBLE-SIDED, and it has to be: this is
              the only opaque thing standing between the camera and the OTHER
              panel's screen. That screen faces away, so its DOM is hidden by
              the backface culler - but a hidden screen's depth mask still
              clears the canvas over it, so with a single-sided board (culled
              from the far side, since it is rotated to face outward) the page
              showed straight through the sign.
            */}
            <mesh geometry={boardGeometry} rotation-y={isFront ? 0 : Math.PI} position-z={isFront ? -0.012 : 0.012}>
              <meshPhysicalMaterial color="#181b17" metalness={0} roughness={0.95} side={THREE.DoubleSide} />
            </mesh>

            {/* live face */}
            <DeviceScreen
              {...screenProps}
              {...resolveSurface(slot, surfaceDefaults)}
              position={[0, 0, isFront ? panel.frameDepth / 2 - 0.02 : -(panel.frameDepth / 2 - 0.02)]}
              rotation={isFront ? [0, 0, 0] : [0, Math.PI, 0]}
            >
              {slot?.children}
            </DeviceScreen>
          </group>
        )
      })}

      {/* architectural butt hinges near the crown ends: segmented knuckle barrel
          with hinge leaves and screw heads hugging both top rails */}
      {([1, -1] as const).map((side) => (
        <group key={side} position={[side * (panel.width / 2 - 0.35), legLift + topY + 0.015, 0]}>
          {/* central hinge pin */}
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.014, 0.014, 0.32, 12]} />
            <meshPhysicalMaterial {...hardware} roughness={0.22} />
          </mesh>
          {/* 3 alternating knuckle barrel sleeves */}
          {[-0.095, 0, 0.095].map((kx) => (
            <mesh key={kx} rotation-z={Math.PI / 2} position-x={kx}>
              <cylinderGeometry args={[0.028, 0.028, 0.088, 14]} />
              <meshPhysicalMaterial {...hardware} />
            </mesh>
          ))}
          {/* front and rear hinge leaf straps seating onto the top rail bevels */}
          {([-1, 1] as const).map((dir) => (
            <group key={dir} rotation-x={dir * tilt}>
              <RoundedBox args={[0.27, 0.012, 0.075]} radius={0.004} position={[0, -0.016, -dir * 0.036]}>
                <meshPhysicalMaterial {...hardware} />
              </RoundedBox>
              {([-0.08, 0.08] as const).map((sx) => (
                <mesh key={sx} position={[sx, -0.01, -dir * 0.05]}>
                  <cylinderGeometry args={[0.012, 0.012, 0.008, 10]} />
                  <meshPhysicalMaterial {...darkMetal} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}

      {/* articulated folding steel scissor-stay arms on both sides at mid-height:
          two hinged links meeting at a raised center pivot rivet, pinned into
          both stiles with metal mounting studs */}
      {([1, -1] as const).map((side) => {
        const stayX = side * (stileX - stileW / 2 - 0.012)
        return (
          <group key={side} position={[stayX, legLift - 0.02, 0]}>
            {([1, -1] as const).map((dir) => (
              <React.Fragment key={dir}>
                {/* hinged stay link */}
                <mesh
                  position={[dir * 0.004, stayKneeLift / 2, dir * (stayHalfSpan / 2)]}
                  rotation-x={dir * stayArmAngle}
                >
                  <boxGeometry args={[0.01, 0.044, stayArmLen + 0.02]} />
                  <meshPhysicalMaterial {...darkMetal} />
                </mesh>
                {/* stile anchor pin */}
                <mesh rotation-z={Math.PI / 2} position={[side * 0.008, 0, dir * stayHalfSpan]}>
                  <cylinderGeometry args={[0.018, 0.018, 0.024, 12]} />
                  <meshPhysicalMaterial {...hardware} />
                </mesh>
              </React.Fragment>
            ))}
            {/* center elbow pivot rivet */}
            <mesh rotation-z={Math.PI / 2} position={[0, stayKneeLift, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.028, 12]} />
              <meshPhysicalMaterial {...hardware} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
AFrameSignImpl.displayName = 'AFrameSign'

/** The sign's compound slots, shared by `<AFrameSign>` and `<AFrameSignMockup>`. */
export const aFrameSignSlots = createSlots(A_FRAME_SIGN_REGIONS)

export const AFrameSign = Object.assign(AFrameSignImpl, aFrameSignSlots)
