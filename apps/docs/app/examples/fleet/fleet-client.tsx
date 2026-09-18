'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExampleBadge, TabbiedLink } from '../_shared/badge'
import { lazyScene } from '../_shared/stage'
import { COMPANY, COVERAGES, LIVERIES, STATS, type CoverageId, type Livery, type LiveryId } from './fleet-data'

const TrailerStage = lazyScene<{ livery: Livery }>(() => import('./fleet-scenes').then((m) => m.TrailerScene))
const VanStage = lazyScene<{ livery: Livery; coverage: CoverageId }>(() => import('./fleet-scenes').then((m) => m.VanScene))
const BoxStage = lazyScene<{ livery: Livery }>(() => import('./fleet-scenes').then((m) => m.BoxScene))
const PhoneStage = lazyScene<{ livery: Livery }>(() => import('./fleet-scenes').then((m) => m.PhoneScene))

/**
 * Northline's website. A freight company sells reliability, and a fleet in
 * one livery is what reliability looks like from the motorway - so the
 * page is the fleet. Two controls reach into it: which livery the company
 * runs, and how much of the van the wrap covers.
 */
export function Fleet() {
  const [liveryId, setLiveryId] = useState<LiveryId>('signal')
  const [coverage, setCoverage] = useState<CoverageId>('full')
  const livery = LIVERIES.find((l) => l.id === liveryId)!

  return (
    <main className="fl" style={{ ['--fl-accent' as string]: livery.accent }}>
      <header className="fl-top">
        <span className="fl-brand">{COMPANY.name}</span>
        <nav className="fl-nav" aria-label="Site">
          <span>Services</span>
          <span>Network</span>
          <span>Fleet</span>
          <span>Track</span>
        </nav>
        <div className="fl-top-right">
          <ExampleBadge className="fl-badge" />
          <span className="fl-cta">Get a quote</span>
        </div>
      </header>

      <section className="fl-hero">
        <p className="fl-eyebrow">Road freight · Benelux, France and Iberia</p>
        <h1>{COMPANY.tag}.</h1>
        <p className="fl-lede">
          Pallets, parcels and the odd piano, moved between forty European cities while you sleep. Same drivers,
          same vans, same livery from the dock to your door.
        </p>
      </section>

      <section className="fl-trailer" aria-label="A Northline trailer">
        <div className="fl-trailer-stage">
          <TrailerStage livery={livery} />
        </div>
        <div className="fl-stats">
          {STATS.map(([n, label]) => (
            <div key={label} className="fl-stat">
              <strong>{n}</strong>
              <span>{label}</span>
            </div>
          ))}
          <p className="fl-caption">A 53 ft dry van, both sides and the doors live. Drag it round.</p>
        </div>
      </section>

      <section className="fl-van">
        <div className="fl-van-stage">
          <VanStage livery={livery} coverage={coverage} />
        </div>
        <div className="fl-van-copy">
          <p className="fl-eyebrow">One livery, every vehicle</p>
          <h2>The same wrap, from a trailer to a box.</h2>
          <p>
            The livery is one React component. The field of marks at the cab end is a <TabbiedLink /> pattern in
            the two inks; the name and the arrow are type. Everything on this page wears it.
          </p>

          <div className="fl-control">
            <span className="fl-control-label">Livery</span>
            <div className="fl-liveries" role="group" aria-label="Livery">
              {LIVERIES.map((l) => (
                <button key={l.id} type="button" className="fl-livery" aria-pressed={l.id === liveryId} onClick={() => setLiveryId(l.id)}>
                  <span className="fl-livery-chip" style={{ background: l.body }}>
                    <span style={{ background: l.ink }} />
                    <span style={{ background: l.accent }} />
                  </span>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="fl-control">
            <span className="fl-control-label">Van coverage</span>
            <div className="fl-seg" role="group" aria-label="Wrap coverage">
              {COVERAGES.map((c) => (
                <button key={c.id} type="button" aria-pressed={c.id === coverage} onClick={() => setCoverage(c.id)}>
                  {c.label}
                  <small>{c.note}</small>
                </button>
              ))}
            </div>
          </div>
          <p className="fl-control-note">
            The mockup carves the wrap around the arches, the lights and the door glass, and remounts the mirrors,
            rails and handles over it. The component underneath does not change.
          </p>
        </div>
      </section>

      <section className="fl-door">
        <div className="fl-door-head">
          <h2>Dock to door</h2>
          <p>The box it ships in and the app that says when it lands, in the same livery as the van that brings it.</p>
        </div>
        <div className="fl-door-grid">
          <article className="fl-card">
            <div className="fl-card-stage">
              <BoxStage livery={livery} />
            </div>
            <div className="fl-card-copy">
              <strong>The box</strong>
              <span>A double-wall mailer, printed on every face, taped by hand.</span>
            </div>
          </article>
          <article className="fl-card">
            <div className="fl-card-stage">
              <PhoneStage livery={livery} />
            </div>
            <div className="fl-card-copy">
              <strong>Track a parcel</strong>
              <span>Five stops from Rotterdam to Lisbon, and a button to leave it with a neighbour.</span>
            </div>
          </article>
        </div>
      </section>

      <footer className="fl-foot">
        <span>Northline is a fictional carrier. The trailer, the van, the box and the phone are live mockups wearing one component.</span>
        <Link href="/docs">Read the react-3d-mockups docs →</Link>
      </footer>
    </main>
  )
}
