'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'

/**
 * Put `text` on the clipboard. The async Clipboard API is the real path; the
 * textarea-and-`execCommand` one is for where it is missing or refused (a
 * non-secure origin such as a LAN preview, an embedding that denies the
 * permission), so the button never silently does nothing.
 */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    try {
      return document.execCommand('copy')
    } catch {
      return false
    } finally {
      area.remove()
    }
  }
}

/**
 * A small "copy" button for a command or a code block.
 *
 * `label` names what it copies ("Copy install command"), because every copy
 * button on the page otherwise announces as the same unlabelled icon. The
 * confirmation is both visible - the icon turns to a tick and says "Copied" -
 * and spoken, through a polite live region: swapping a button's own label is
 * not reliably announced while it keeps focus. The region sits beside the
 * button, not in it, because a button's contents are presentational and a
 * live region inside one is never exposed at all.
 */
export function CopyButton({ text, label, className }: { text: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const onClick = async () => {
    if (!(await copyText(text))) return
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1800)
  }

  return (
    <>
      <button
        type="button"
        className={className ? `copy-btn ${className}` : 'copy-btn'}
        aria-label={label}
        data-copied={copied}
        onClick={onClick}
      >
        {copied ? <Check size={14} strokeWidth={2.25} aria-hidden /> : <Copy size={14} strokeWidth={2} aria-hidden />}
        <span className="copy-btn-text">{copied ? 'Copied' : 'Copy'}</span>
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </>
  )
}
