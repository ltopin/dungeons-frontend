import type { ReactNode } from 'react'

export function SectionTitle({ children, accent }: { children: ReactNode; accent?: 'gold' | 'blood' | 'blue' }) {
  return <div className={`section-title ${accent ? 'accent-' + accent : ''}`}>{children}</div>
}

export function NumBox({
  label,
  value,
  onChange,
  width = 56,
}: {
  label: string
  value: string | number
  onChange: (value: string) => void
  width?: number
}) {
  return (
    <label className="numbox">
      <input
        className="numbox-input"
        type="number"
        inputMode="numeric"
        style={{ width }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="numbox-label">{label}</span>
    </label>
  )
}

export function Seal({
  abbr,
  label,
  mod,
  children,
}: {
  abbr: string
  label: string
  mod: string
  children: ReactNode
}) {
  return (
    <label className="seal">
      <span className="seal-hex">
        <span className="seal-abbr">{abbr}</span>
        {children}
        <span className="seal-label-text">{label}</span>
      </span>
      <span className="seal-mod">{mod}</span>
    </label>
  )
}

export function Dial({ label, sub, children }: { label: string; sub?: string; children: ReactNode }) {
  return (
    <div className="dial">
      {children}
      <div className="dial-label">{label}</div>
      {sub && <div className="dial-sub">{sub}</div>}
    </div>
  )
}

export function IconButton({
  children,
  onClick,
  title,
  danger,
}: {
  children: ReactNode
  onClick: () => void
  title: string
  danger?: boolean
}) {
  return (
    <button type="button" className={`icon-btn ${danger ? 'danger' : ''}`} onClick={onClick} title={title}>
      {children}
    </button>
  )
}
