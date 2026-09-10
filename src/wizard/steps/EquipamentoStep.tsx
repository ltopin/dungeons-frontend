import { useEffect, useState } from 'react'
import type { FichaAtaque, FichaItem, FichaMoedas } from '../../api/types'
import type { CompendioClasse } from '../../api/compendioTypes'
import { useSectionAutosave } from '../../sheet/useSectionAutosave'
import { useListSection } from '../../sheet/useListSection'
import { CATALOGO_EQUIPAMENTO, OURO_INICIAL_POR_CLASSE, PACOTES_INICIAIS, itemEquipamentoPorId } from '../../rules/srd/equipment'

export function EquipamentoStep({
  fichaId,
  moedas,
  itens,
  ataques,
  classe,
  onMoedasSaved,
  onItensChange,
  onAtaquesChange,
  onConcluir,
}: {
  fichaId: string
  moedas: FichaMoedas
  itens: FichaItem[]
  ataques: FichaAtaque[]
  classe: CompendioClasse | undefined
  onMoedasSaved?: (moedas: FichaMoedas) => void
  onItensChange?: (itens: FichaItem[]) => void
  onAtaquesChange?: (ataques: FichaAtaque[]) => void
  onConcluir: () => void
}) {
  const ouroInicialMedio = classe ? (OURO_INICIAL_POR_CLASSE[classe.nome] ?? 100) : 0
  const moedasAutosave = useSectionAutosave<FichaMoedas>(fichaId, 'moedas', moedas, undefined, onMoedasSaved)
  const lista = useListSection<FichaItem>(fichaId, 'itens', itens, undefined, onItensChange)
  const ataquesLista = useListSection<FichaAtaque>(fichaId, 'ataques', ataques, undefined, onAtaquesChange)
  const [pacoteAplicado, setPacoteAplicado] = useState(false)

  useEffect(() => {
    if (classe && lista.items.length === 0 && !moedasAutosave.value.gp) {
      moedasAutosave.updateField('gp', ouroInicialMedio)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classe])

  /**
   * Adiciona o item ao inventário e, quando é uma arma com dados de combate
   * cadastrados, também cria o Ataque correspondente — ver
   * `compra-arma-cria-ataque`/design.md, decisão 2. `bonus` fica em branco,
   * como qualquer Ataque adicionado manualmente (depende de BAB/atributos,
   * fora de escopo aqui).
   */
  function adquirirItem(itemId: string): void {
    const item = itemEquipamentoPorId(itemId)
    if (!item) return
    lista.addItem({ nome: item.nome, quantidade: 1, peso: item.pesoKg, notas: `${item.custoGp} po` })
    if (item.combate) {
      ataquesLista.addItem({
        arma: item.nome,
        bonus: '',
        dano: item.combate.dano,
        critico: item.combate.critico,
        tipo: item.combate.tipo,
        alcance: item.combate.alcance ?? '',
        tamanho: item.combate.tamanho,
        propriedadesEspeciais: item.combate.propriedadesEspeciais ?? '',
      })
    }
  }

  function aplicarPacoteInicial() {
    if (!classe || pacoteAplicado) return
    const ids = PACOTES_INICIAIS[classe.nome] ?? []
    let gpRestante = moedasAutosave.value.gp
    for (const itemId of ids) {
      const item = itemEquipamentoPorId(itemId)
      if (!item || item.custoGp > gpRestante) continue
      gpRestante -= item.custoGp
      adquirirItem(itemId)
    }
    moedasAutosave.updateField('gp', gpRestante)
    setPacoteAplicado(true)
  }

  function comprarItem(itemId: string) {
    const item = itemEquipamentoPorId(itemId)
    if (!item || item.custoGp > moedasAutosave.value.gp) return
    adquirirItem(itemId)
    moedasAutosave.updateField('gp', moedasAutosave.value.gp - item.custoGp)
  }

  function removerItemComprado(item: FichaItem) {
    const custo = Number(item.notas.match(/[\d.]+/)?.[0] ?? 0)
    lista.removeItem(item.id)
    const ataqueCorrespondente = ataquesLista.items.find((a) => a.arma === item.nome)
    if (ataqueCorrespondente) {
      ataquesLista.removeItem(ataqueCorrespondente.id)
    }
    moedasAutosave.updateField('gp', moedasAutosave.value.gp + custo)
  }

  const [confirmando, setConfirmando] = useState(false)

  async function confirmar() {
    setConfirmando(true)
    try {
      await moedasAutosave.flush()
      onConcluir()
    } catch {
      // erro já sinalizado pelo SaveStatusBadge; permanece na etapa
    } finally {
      setConfirmando(false)
    }
  }

  return (
    <section aria-label="Equipamento" className="wizard-step">
      <div className="section-header">
        <h2>Equipamento inicial</h2>
      </div>
      {lista.createError && <p role="alert">{lista.createError}</p>}
      {ataquesLista.createError && <p role="alert">{ataquesLista.createError}</p>}
      {!classe && <p className="hint">Escolha uma classe na primeira etapa para saber seu ouro inicial.</p>}

      <p className="wizard-points-remaining">{moedasAutosave.value.gp} po disponíveis</p>

      {classe && !pacoteAplicado && (
        <button type="button" className="add-btn" onClick={aplicarPacoteInicial}>
          Usar pacote inicial de {classe?.nome}
        </button>
      )}

      <ul className="wizard-shop-list">
        {CATALOGO_EQUIPAMENTO.map((item) => (
          <li key={item.id} className="wizard-shop-row">
            <span>
              {item.nome} <span className="hint">({item.custoGp} po, {item.pesoKg}kg)</span>
            </span>
            <button
              type="button"
              className="add-btn small"
              disabled={item.custoGp > moedasAutosave.value.gp}
              onClick={() => comprarItem(item.id)}
            >
              Comprar
            </button>
          </li>
        ))}
      </ul>

      <h3>Itens adquiridos</h3>
      {lista.items.length === 0 ? (
        <p className="hint">Nenhum item ainda.</p>
      ) : (
        <ul className="list-section">
          {lista.items.map((item) => (
            <li key={item.id}>
              <span>
                {item.nome} — {item.notas}
              </span>
              <div className="list-item-actions">
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={() => removerItemComprado(item)}
                  title={`Remover ${item.nome}`}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="wizard-step-actions">
        <button type="button" className="add-btn" disabled={confirmando} onClick={confirmar}>
          {confirmando ? 'Salvando…' : 'Confirmar equipamento'}
        </button>
      </div>
    </section>
  )
}
