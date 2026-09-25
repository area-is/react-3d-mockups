'use client'

import type { ReactNode } from 'react'
import { SERIF } from './label-art'
import { CUT, Cut, Face, Small } from './sample-kit'

/**
 * Crumb & Co., a neighbourhood bakery, across every live pane of the
 * storefront: the four fascia boards, the two display bays, the door and
 * the side and back windows.
 *
 * A bakery like this is signwritten rather than branded - a painted board,
 * gilt serif letters, a door lettered in the same gold on the glass - so the
 * signs and the door are bottle green with gold, and the display bays are
 * cream posters of the two things the shop is known for. The shopfront's
 * own paint (`color`) is a green in the same family, so the boards read as
 * part of the joinery rather than as panels hung on it.
 */

const BAKERY = { green: '#1f3a2e', glass: '#16261f', gold: '#d9b36c', cream: '#f4ecdc', ink: '#2a2016', crust: '#a4542a' }

/** The name, in gilt serif. `size` is any CSS length. */
function Name({ size, color = BAKERY.gold }: { size: string; color?: string }) {
  return (
    <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: size, letterSpacing: '-0.02em', lineHeight: 1, color, whiteSpace: 'nowrap' }}>
      Crumb &amp; Co.
    </span>
  )
}

/** A small gilt lozenge between words on a board. */
function Pip() {
  return <span aria-hidden style={{ width: 'min(9cqh, 0.8cqw)', height: 'min(9cqh, 0.8cqw)', background: BAKERY.gold, transform: 'rotate(45deg)', flex: 'none' }} />
}

/**
 * A fascia board: the name in the middle and what the shop sells either
 * side of it. One layout for all four boards - the front's is 12:1 and the
 * sides' 8.4:1, so every size is the smaller of a share of the board's
 * height and a share of its width, and the line fits either.
 */
export function CrumbFascia() {
  const side = (children: ReactNode) => (
    <span style={{ fontSize: 'min(30cqh, 2.7cqw)', fontWeight: 600, letterSpacing: '-0.01em', color: BAKERY.cream, whiteSpace: 'nowrap' }}>{children}</span>
  )
  return (
    <Face
      ground={BAKERY.green}
      ink={BAKERY.cream}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 'min(9cqh, 1.6cqw)', padding: '0 4cqw', boxShadow: `inset 0 0 0 5cqh ${BAKERY.green}, inset 0 0 0 7cqh ${BAKERY.gold}` }}
    >
      {side('Bread · Pastry')}
      <Pip />
      <Name size="min(66cqh, 6.2cqw)" />
      <Pip />
      {side('Coffee · Est. 2019')}
    </Face>
  )
}

/** A display-bay poster: a loaf, a line, a price. */
function BayPoster({ image, title, note, price }: { image: ReactNode; title: ReactNode; note: string; price: string }) {
  return (
    <Face ground={BAKERY.cream} ink={BAKERY.ink} style={{ padding: '7cqw 7cqw 6cqw' }}>
      {image}
      <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '9.6cqw', lineHeight: 0.98, letterSpacing: '-0.03em', position: 'relative' }}>{title}</div>
      <Small size="3.6cqw" style={{ marginTop: '3cqw', maxWidth: '40cqw', position: 'relative', opacity: 0.85 }}>
        {note}
      </Small>
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: '2.4cqw', position: 'relative' }}>
        <Name size="4.6cqw" color={BAKERY.green} />
        <span style={{ fontSize: '4.6cqw', fontWeight: 800, color: BAKERY.crust, letterSpacing: '-0.03em' }}>{price}</span>
      </div>
    </Face>
  )
}

/** The left bay: the sourdough. */
export function CrumbLoafBay() {
  return (
    <BayPoster
      image={<Cut of={CUT.sourdough} style={{ right: '2cqw', bottom: '5cqh', width: '40cqw' }} />}
      title={
        <>
          Sourdough,
          <br />
          <span style={{ fontStyle: 'italic' }}>baked at 5 am.</span>
        </>
      }
      note="Our country loaf: three days from starter to crust, and gone by lunchtime."
      price="£5.20"
    />
  )
}

/** The right bay: the croissant. */
export function CrumbCroissantBay() {
  return (
    <BayPoster
      image={<Cut of={CUT.croissant} style={{ right: '2cqw', bottom: '16cqh', width: '50cqw', transform: 'rotate(-8deg)' }} />}
      title={
        <>
          Butter, flour
          <br />
          <span style={{ fontStyle: 'italic' }}>and patience.</span>
        </>
      }
      note="Laminated overnight, out of the oven from seven."
      price="£2.90"
    />
  )
}

/**
 * The door: lettered in gold on the glass, the way a signwriter does a shop
 * door - the name at the head, the hours at eye level, the push plate's word
 * at hand height.
 */
export function CrumbDoor() {
  const hours: [string, string][] = [
    ['Mon – Fri', '7 – 4'],
    ['Saturday', '8 – 4'],
    ['Sunday', '8 – 2'],
  ]
  return (
    <Face
      ground={BAKERY.glass}
      ink={BAKERY.gold}
      style={{ alignItems: 'center', textAlign: 'center', padding: '14cqw 9cqw 12cqw', background: `linear-gradient(115deg, #22362d 0%, ${BAKERY.glass} 45%, #0f1a15 100%)` }}
    >
      <Name size="14cqw" />
      <Small size="6cqw" style={{ color: BAKERY.cream, marginTop: '3cqw', opacity: 0.85 }}>
        Bakery &amp; coffee
      </Small>
      <div style={{ width: '20cqw', height: '0.9cqw', background: BAKERY.gold, margin: '9cqw 0', flex: 'none' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '3cqw 6cqw', fontSize: '7cqw', color: BAKERY.cream, textAlign: 'left' }}>
        {hours.map(([d, h]) => (
          <div key={d} style={{ display: 'contents' }}>
            <span style={{ opacity: 0.8 }}>{d}</span>
            <span style={{ fontWeight: 700, textAlign: 'right' }}>{h}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', fontSize: '15cqw', fontWeight: 800, letterSpacing: '-0.03em' }}>Push</div>
      <Small size="5.4cqw" style={{ color: BAKERY.cream, marginTop: '14cqw', opacity: 0.7 }}>
        Cards &amp; cash · Dogs welcome
      </Small>
    </Face>
  )
}

/** A side window: a line of gold on the glass, with a smaller one under it. */
function SideWindow({ head, lines }: { head: ReactNode; lines: string }) {
  return (
    <Face
      ground={BAKERY.glass}
      ink={BAKERY.gold}
      style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '3.4cqw', background: `linear-gradient(115deg, #22362d 0%, ${BAKERY.glass} 45%, #0f1a15 100%)` }}
    >
      <div style={{ fontFamily: SERIF, fontWeight: 500, fontSize: '10cqw', lineHeight: 1, letterSpacing: '-0.02em' }}>{head}</div>
      <Small size="4cqw" style={{ color: BAKERY.cream, opacity: 0.85, whiteSpace: 'pre-line' }}>
        {lines}
      </Small>
    </Face>
  )
}

/** The left elevation's window: the coffee, and whose it is. */
export function CrumbCoffeeWindow() {
  return (
    <SideWindow
      head={
        <>
          Coffee by <span style={{ fontStyle: 'italic' }}>Halyard</span>
        </>
      }
      lines={'Roasted in Portland, Maine, and ground to order.\nFlat white £3.20 · Filter £2.60'}
    />
  )
}

/** The right elevation's window: cakes to order. */
export function CrumbCakeWindow() {
  return (
    <SideWindow
      head={
        <>
          Cakes <span style={{ fontStyle: 'italic' }}>to order</span>
        </>
      }
      lines={'Birthdays, weddings and ordinary Tuesdays.\nTwo days’ notice, please.'}
    />
  )
}

/** The back window, by the yard gate: where the deliveries go. */
export function CrumbRearWindow() {
  return <SideWindow head="Deliveries" lines={'Please ring the bell · 6 – 10 am\nand keep the yard gate clear'} />
}
