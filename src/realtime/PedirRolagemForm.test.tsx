import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PedirRolagemForm } from './PedirRolagemForm'

const jogadores = [
  { contaId: 'conta-2', nome: 'Fulano' },
  { contaId: 'conta-3', nome: 'Thoromir' },
]

describe('PedirRolagemForm', () => {
  it('lista os jogadores da campanha e a opção de toda a mesa', () => {
    render(<PedirRolagemForm jogadores={jogadores} onPedir={vi.fn()} />)

    expect(screen.getByRole('option', { name: 'Toda a mesa' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Fulano' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Thoromir' })).toBeInTheDocument()
  })

  it('pede rolagem a um jogador específico quando selecionado', async () => {
    const user = userEvent.setup()
    const onPedir = vi.fn().mockResolvedValue({})
    render(<PedirRolagemForm jogadores={jogadores} onPedir={onPedir} />)

    await user.selectOptions(screen.getByLabelText('Jogador'), 'conta-2')
    await user.type(screen.getByLabelText('Descrição'), 'Teste de Reflexos CD 15')
    await user.click(screen.getByRole('button', { name: 'Pedir rolagem' }))

    expect(onPedir).toHaveBeenCalledWith({ destinatarioContaId: 'conta-2', descricao: 'Teste de Reflexos CD 15' })
  })

  it('pede rolagem a toda a mesa quando nenhum jogador é selecionado', async () => {
    const user = userEvent.setup()
    const onPedir = vi.fn().mockResolvedValue({})
    render(<PedirRolagemForm jogadores={jogadores} onPedir={onPedir} />)

    await user.type(screen.getByLabelText('Descrição'), 'Teste de Percepção')
    await user.click(screen.getByRole('button', { name: 'Pedir rolagem' }))

    expect(onPedir).toHaveBeenCalledWith({ destinatarioContaId: undefined, descricao: 'Teste de Percepção' })
  })

  it('bloqueia o envio sem descrição', async () => {
    const user = userEvent.setup()
    const onPedir = vi.fn()
    render(<PedirRolagemForm jogadores={jogadores} onPedir={onPedir} />)

    await user.click(screen.getByRole('button', { name: 'Pedir rolagem' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/descreva a rolagem/i)
    expect(onPedir).not.toHaveBeenCalled()
  })
})
