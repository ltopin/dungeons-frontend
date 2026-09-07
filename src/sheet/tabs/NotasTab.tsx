import type { FichaNotas } from '../../api/types'
import { useSectionAutosave } from '../useSectionAutosave'
import { SaveStatusBadge } from '../SaveStatusBadge'

export function NotasTab({ fichaId, notas }: { fichaId: string; notas: FichaNotas }) {
  const { value, updateField, status, retry } = useSectionAutosave<FichaNotas>(fichaId, 'notas', notas)

  return (
    <section aria-label="Notas" className="panel">
      <div className="section-header">
        <h2>Notas</h2>
        <SaveStatusBadge status={status} onRetry={retry} />
      </div>
      <textarea
        className="notes-area"
        rows={12}
        value={value.texto}
        onChange={(e) => updateField('texto', e.target.value)}
      />
    </section>
  )
}
