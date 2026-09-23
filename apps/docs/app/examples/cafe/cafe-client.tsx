'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TabbiedLink } from '../_shared/badge'
import { lazyScene } from '../_shared/stage'
import { BAKES, DRINKS, PAINTS, SHOP, price, type MenuItem, type PaintId } from './cafe-data'

const StorefrontStage = lazyScene<{ open: boolean; paint: string }>(() => import('./cafe-scenes').then((m) => m.StorefrontScene))
const BoardStage = lazyScene(() => import('./cafe-scenes').then((m) => m.BoardScene))
const CartonStage = lazyScene(() => import('./cafe-scenes').then((m) => m.CartonScene))
const CardStage = lazyScene<{ paint: string }>(() => import('./cafe-scenes').then((m) => m.CardScene))

function MenuList({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <div className="cf-menu">
      <h3>{title}</h3>
      {items.map((item) => (
        <div key={item.name} className="cf-menu-row">
          <span className="cf-menu-name">
            {item.name}
            {item.note ? <em>{item.note}</em> : null}
          </span>
          <span className="cf-menu-dots" aria-hidden />
          <span className="cf-menu-price">{price(item.price)}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Ninefold's website. A local business, so the page is the shop: the front
 * of it, the board outside it, the carton on its counter, the card in your
 * wallet. Two controls on the page reach into the storefront - whether it
 * is open, and what colour it is painted - because a shop's site is the
 * thing an owner changes on a Sunday evening, and this one changes live.
 */
export function Cafe() {
  const [open, setOpen] = useState(true)
  const [paintId, setPaintId] = useState<PaintId>('green')
  const paint = PAINTS.find((p) => p.id === paintId)!.color

  return (
    <main className="cf" style={{ ['--cf-paint' as string]: paint }}>
      <header className="cf-top">
        <span className="cf-brand">{SHOP.name}</span>
        <nav className="cf-nav" aria-label="Site">
          <span>Menu</span>
          <span>Bakery</span>
          <span>Beans</span>
          <span>Find us</span>
        </nav>
        <div className="cf-top-right">
          <span className="cf-cta">Order ahead</span>
        </div>
      </header>

      <section className="cf-hero">
        <p className="cf-eyebrow">
          {SHOP.kind} · {SHOP.address}, {SHOP.city}
        </p>
        <h1>Coffee, bread, and a corner to sit in.</h1>
        <p className="cf-lede">
          We roast on Tuesdays, bake every morning and make our own oat milk because the bought kind would not
          steam. Nine coffees and the tenth is on us.
        </p>
      </section>

      <section className="cf-shop" aria-label="The shop">
        <div className="cf-shop-stage">
          <StorefrontStage open={open} paint={paint} />
        </div>
        <div className="cf-controls">
          <div className="cf-control">
            <span className="cf-control-label">Right now</span>
            <div className="cf-seg" role="group" aria-label="Open or closed">
              <button type="button" aria-pressed={open} onClick={() => setOpen(true)}>
                Open
              </button>
              <button type="button" aria-pressed={!open} onClick={() => setOpen(false)}>
                Closed
              </button>
            </div>
          </div>
          <div className="cf-control">
            <span className="cf-control-label">Paint</span>
            <div className="cf-paints" role="group" aria-label="Shopfront paint">
              {PAINTS.map((p) => (
                <button key={p.id} type="button" className="cf-paint" aria-pressed={p.id === paintId} aria-label={p.label} title={p.label} onClick={() => setPaintId(p.id)}>
                  <span style={{ background: p.color }} />
                </button>
              ))}
            </div>
          </div>
          <p className="cf-control-note">
            The sign in the door, the glass and the fascia follow. Drag the shop to walk round it: every elevation is
            signed.
          </p>
        </div>
      </section>

      <section className="cf-board">
        <div className="cf-board-copy">
          <p className="cf-eyebrow">Today&rsquo;s board</p>
          <h2>What is on this morning</h2>
          <p>
            The board on the pavement and this list are the same array. Change a price here and the chalk changes
            with it.
          </p>
          <MenuList title="Coffee" items={DRINKS} />
          <MenuList title="From the oven" items={BAKES} />
        </div>
        <div className="cf-board-stage">
          <BoardStage />
        </div>
      </section>

      <section className="cf-goods">
        <article className="cf-good">
          <div className="cf-good-stage">
            <CartonStage />
          </div>
          <div className="cf-good-copy">
            <h2>Ninefold Oat</h2>
            <p>
              Portuguese oats, a little oil and salt, and nothing that stops it frothing. In every drink here, and on
              the counter to take home. The print is a <TabbiedLink /> pattern on plain board.
            </p>
            <span className="cf-good-price">1 L · {price(3.9)}</span>
          </div>
        </article>
        <article className="cf-good">
          <div className="cf-good-stage">
            <CardStage paint={paint} />
          </div>
          <div className="cf-good-copy">
            <h2>Nine, then one on us</h2>
            <p>
              A card, a stamp per coffee, and the tenth free. The back is painted the shop&rsquo;s colour, so it
              repaints when the shop does.
            </p>
            <span className="cf-good-price">Ask at the counter</span>
          </div>
        </article>
      </section>

      <footer className="cf-foot">
        <div className="cf-foot-cols">
          <span>
            <strong>{SHOP.name}</strong>
            <br />
            {SHOP.address}
            <br />
            {SHOP.city}
          </span>
          <span>
            <strong>Hours</strong>
            <br />
            {SHOP.hours.split(' · ').map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </span>
          <span>
            <strong>Say hello</strong>
            <br />
            {SHOP.phone}
            <br />
            hello@ninefold.coffee
          </span>
        </div>
        <div className="cf-foot-note">
          <span>Ninefold is a fictional shop. The building, the board, the carton and the card are live mockups.</span>
          <Link href="/docs">Read the react-3d-mockups docs →</Link>
        </div>
      </footer>
    </main>
  )
}
