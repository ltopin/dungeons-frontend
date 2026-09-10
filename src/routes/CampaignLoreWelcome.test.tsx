import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CampaignLoreWelcome } from './CampaignLoreWelcome'
import type { ElementoHistoria } from '../api/types'

const ELEMENTOS: ElementoHistoria[] = [
  { id: 'elem-1', mundoId: 'mundo-1', titulo: 'Bane', categoria: 'Divindade', conteudo: 'O deus da tirania.', status: 'publicado' },
  { id: 'elem-2', mundoId: 'mundo-1', titulo: 'Waterdeep', categoria: 'Local', conteudo: 'A cidade das máscaras.', status: 'publicado' },
]

describe('CampaignLoreWelcome', () => {
  it('exibe a lore publicada agrupada por categoria', () => {
    render(<CampaignLoreWelcome elementos={ELEMENTOS} onIniciar={vi.fn()} />)

    expect(screen.getByText('Divindade')).toBeInTheDocument()
    expect(screen.getByText('Bane')).toBeInTheDocument()
    expect(screen.getByText('Local')).toBeInTheDocument()
    expect(screen.getByText('Waterdeep')).toBeInTheDocument()
  })

  it('navega para o assistente ao confirmar', async () => {
    const onIniciar = vi.fn()
    const user = userEvent.setup()
    render(<CampaignLoreWelcome elementos={ELEMENTOS} onIniciar={onIniciar} />)

    await user.click(screen.getByRole('button', { name: 'Começar a criar meu personagem' }))

    expect(onIniciar).toHaveBeenCalledTimes(1)
  })
})
