import type { ElementoHistoria } from '../api/types'
import { LoreList } from './LoreList'

export function CampaignLoreWelcome({
  elementos,
  onIniciar,
}: {
  elementos: ElementoHistoria[]
  onIniciar: () => void
}) {
  return (
    <main className="campaigns-screen">
      <header className="campaigns-screen__masthead">
        <h1 id="boas-vindas-heading">Bem-vindo à campanha</h1>
      </header>

      <section className="campaigns-screen__panel" aria-labelledby="boas-vindas-heading">
        <p className="campaigns-screen__hint">
          Antes de criar seu personagem, conheça a história já publicada deste mundo.
        </p>
        <LoreList elementos={elementos} />
        <div className="wizard-step-actions">
          <button type="button" className="add-btn" onClick={onIniciar}>
            Começar a criar meu personagem
          </button>
        </div>
      </section>
    </main>
  )
}
