import { useState, type ReactNode } from 'react'

export function SectionTitle({ children, accent }: { children: ReactNode; accent?: 'gold' | 'blood' | 'blue' }) {
  return <div className={`section-title ${accent ? 'accent-' + accent : ''}`}>{children}</div>
}

/**
 * Um campo rotulado (label + controle), sempre com a mesma marcação. Existe
 * para que toda aba use exatamente a mesma estrutura de label — evita o bug
 * de abas divergentes que motivou este componente: algumas envolviam campos
 * em `.field-grid`/`<form>` (span empilhado sobre o input, com espaçamento) e
 * outras renderizavam `<label>` soltos, que caem no `display: inline` padrão
 * do navegador e ficam com o texto colado no controle.
 */
export function Field({ label, children, title }: { label: string; children: ReactNode; title?: string }) {
  return (
    <label className="field" title={title}>
      <span>{label}</span>
      {children}
    </label>
  )
}

export function NumBox({
  label,
  value,
  onChange,
  width = 56,
  readOnly,
}: {
  label: string
  value: string | number
  onChange?: (value: string) => void
  width?: number
  readOnly?: boolean
}) {
  return (
    <label className="numbox">
      <input
        className="numbox-input"
        type="number"
        inputMode="numeric"
        style={{ width }}
        value={value}
        readOnly={readOnly}
        onChange={readOnly ? undefined : (e) => onChange?.(e.target.value)}
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
    <label className="dial">
      {children}
      <div className="dial-label">{label}</div>
      {sub && <div className="dial-sub">{sub}</div>}
    </label>
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
    <button
      type="button"
      className={`icon-btn ${danger ? 'danger' : ''}`}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  )
}

/**
 * Botão de excluir com confirmação dentro do próprio tema, no lugar de
 * `window.confirm()`: um clique troca o ícone por "confirmar/cancelar"
 * inline, sem interromper a página com um diálogo nativo do sistema.
 */
export function ConfirmIconButton({
  onConfirm,
  title,
  confirmLabel,
}: {
  onConfirm: () => void
  title: string
  confirmLabel: string
}) {
  const [confirmando, setConfirmando] = useState(false)

  if (confirmando) {
    return (
      <span className="confirm-inline">
        <span className="confirm-inline-label">{confirmLabel}</span>
        <button
          type="button"
          className="icon-btn danger"
          onClick={() => {
            setConfirmando(false)
            onConfirm()
          }}
          title="Confirmar remoção"
          aria-label="Confirmar remoção"
        >
          ✓
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => setConfirmando(false)}
          title="Cancelar"
          aria-label="Cancelar remoção"
        >
          ✕
        </button>
      </span>
    )
  }

  return (
    <IconButton danger title={title} onClick={() => setConfirmando(true)}>
      ✕
    </IconButton>
  )
}
