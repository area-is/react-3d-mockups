'use client'

import { useState, type ReactNode } from 'react'
import { CopyButton } from './copy-button'

export interface InstallOption {
  /** The package manager, which is also the switcher's label. */
  id: string
  /** The command as typed, for the clipboard. */
  command: string
  /** The same command, highlighted on the server. */
  code: ReactNode
}

/**
 * The quick start's install line, with a switcher for the package manager.
 *
 * All three lines are highlighted on the server and handed in rendered; this
 * component only picks which one shows, so Shiki never ships to the browser.
 * The switcher is a row of toggle buttons (`aria-pressed`) rather than an
 * ARIA tablist: a tablist promises arrow-key roving focus, and three buttons
 * that each just switch the line below need nothing more than Tab and Enter.
 */
export function InstallTabs({ options }: { options: InstallOption[] }) {
  const [selected, setSelected] = useState(options[0].id)
  const current = options.find((o) => o.id === selected) ?? options[0]

  return (
    <div className="code-panel quickstart-install">
      <div className="code-panel-head">
        <div className="pm-switch" role="group" aria-label="Package manager">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="pm-switch-btn"
              aria-pressed={option.id === current.id}
              onClick={() => setSelected(option.id)}
            >
              {option.id}
            </button>
          ))}
        </div>
        <CopyButton text={current.command} label={`Copy ${current.id} install command`} />
      </div>
      {current.code}
    </div>
  )
}
