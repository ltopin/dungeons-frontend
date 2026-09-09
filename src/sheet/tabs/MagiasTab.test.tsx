import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MagiasTab } from './MagiasTab'
import { criarFichaFake } from '../../test/fixtures'

vi.mock('../../api/sheets')

describe('MagiasTab', () => {
  it('não quebra quando magiasConfig.atributoConjuracao vem null da API', () => {
    const ficha = criarFichaFake({
      magiasConfig: { atributoConjuracao: null as unknown as string, nivelConjurador: 0, cdOutros: 0 },
    })

    render(
      <MagiasTab
        fichaId={ficha.id}
        magiasConfig={ficha.magiasConfig}
        magiaNiveis={ficha.magiaNiveis}
        magias={ficha.magias}
        geral={ficha.geral}
      />,
    )

    expect(screen.getByText('Configuração de magias')).toBeInTheDocument()
  })

  it('não quebra quando uma magia existente tem campos de detalhamento null (coluna nova sem valor)', () => {
    const ficha = criarFichaFake({
      magias: [
        {
          id: 'm1',
          nivel: 0,
          nome: 'Luz',
          preparada: false,
          notas: '',
          escola: null as unknown as string,
          tempoFormulacao: null as unknown as string,
          componentes: null as unknown as string,
          alcance: null as unknown as string,
          alvoEfeito: null as unknown as string,
          duracao: null as unknown as string,
          testeResistencia: null as unknown as string,
          resistenciaMagia: null as unknown as string,
          descricao: null as unknown as string,
        },
      ],
    })

    render(
      <MagiasTab
        fichaId={ficha.id}
        magiasConfig={ficha.magiasConfig}
        magiaNiveis={ficha.magiaNiveis}
        magias={ficha.magias}
        geral={ficha.geral}
      />,
    )

    expect(screen.getByDisplayValue('Luz')).toBeInTheDocument()
  })
})
