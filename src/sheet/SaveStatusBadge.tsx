import type { SaveStatus } from './useSectionAutosave'

const LABELS: Record<SaveStatus, string> = {
  idle: '',
  salvando: 'Salvando…',
  salvo: 'Salvo',
  erro: 'Erro ao salvar',
}

export function SaveStatusBadge({ status, onRetry }: { status: SaveStatus; onRetry?: () => void }) {
  if (status === 'idle') return null
  return (
    <span className={`save-status save-status--${status}`} role="status">
      {LABELS[status]}
      {status === 'erro' && onRetry && (
        <button type="button" className="save-status__retry" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </span>
  )
}
