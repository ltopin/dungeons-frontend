export function RoSeal({ abbr, label, mod, value }: { abbr: string; label: string; mod: string; value: number }) {
  return (
    <div className="seal">
      <span className="seal-hex">
        <span className="seal-abbr">{abbr}</span>
        <span className="ro-value">{value}</span>
        <span className="seal-label-text">{label}</span>
      </span>
      <span className="seal-mod">{mod}</span>
    </div>
  )
}

export function RoField({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="ro-field">
      <span className="field-label">{label}</span>
      <span className="ro-field-value">{value}</span>
    </div>
  )
}

export function RoNumBox({ label, value, width = 56 }: { label: string; value: string | number; width?: number }) {
  return (
    <div className="numbox">
      <span className="ro-value" style={{ width }}>
        {value}
      </span>
      <span className="numbox-label">{label}</span>
    </div>
  )
}

export function RoStar({ active, title }: { active: boolean; title: string }) {
  return <span className={`ro-star${active ? ' is-active' : ''}`} title={title} />
}
