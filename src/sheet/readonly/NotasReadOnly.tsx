import type { FichaNotas } from '../../api/types'

export function NotasReadOnly({ notas }: { notas: FichaNotas }) {
  return (
    <section aria-label="Notas" className="panel">
      <h2>Notas</h2>
      {notas.texto.trim() === '' ? (
        <p className="ro-notes ro-notes--vazio">Nenhuma nota registrada.</p>
      ) : (
        <div className="notes-area ro-notes">{notas.texto}</div>
      )}
    </section>
  )
}
