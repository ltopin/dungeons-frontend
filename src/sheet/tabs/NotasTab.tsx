import type { FichaNotas } from '../../api/types'
import { useSectionAutosave } from '../useSectionAutosave'
import { SaveStatusBadge } from '../SaveStatusBadge'

export function NotasTab({
  fichaId,
  notas,
  onSaved,
}: {
  fichaId: string
  notas: FichaNotas
  onSaved?: (notas: FichaNotas) => void
}) {
  const { value, updateField, status, retry } = useSectionAutosave<FichaNotas>(
    fichaId,
    'notas',
    notas,
    undefined,
    onSaved,
  )

  return (
    <section aria-label="Notas" className="panel">
      <div className="section-header">
        <h2 id="notas-heading">Notas</h2>
        <SaveStatusBadge status={status} onRetry={retry} />
      </div>
      <textarea
        className="notes-area"
        rows={12}
        aria-labelledby="notas-heading"
        value={value.texto}
        onChange={(e) => updateField('texto', e.target.value)}
      />
    </section>
  )
}
