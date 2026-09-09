import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AssumirMestreConfirm } from './AssumirMestreConfirm'
import * as aiMasterApi from '../api/aiMaster'

vi.mock('../api/aiMaster')

const aiMasterMock = vi.mocked(aiMasterApi)

describe('AssumirMestreConfirm', () => {
  it('exige uma etapa de confirmação explícita antes de disparar o handoff', async () => {
    const user = userEvent.setup()
    render(<AssumirMestreConfirm campanhaId="camp-1" onHandoffConcluido={vi.fn()} />)

    expect(screen.queryByText(/irreversível/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Assumir como mestre' }))

    expect(screen.getByText(/irreversível/i)).toBeInTheDocument()
    expect(aiMasterMock.assumirComoMestre).not.toHaveBeenCalled()
  })

  it('cancelar a confirmação não dispara o handoff nem altera nada', async () => {
    const user = userEvent.setup()
    render(<AssumirMestreConfirm campanhaId="camp-1" onHandoffConcluido={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Assumir como mestre' }))
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByRole('button', { name: 'Assumir como mestre' })).toBeInTheDocument()
    expect(screen.queryByText(/irreversível/i)).not.toBeInTheDocument()
    expect(aiMasterMock.assumirComoMestre).not.toHaveBeenCalled()
  })

  it('confirmar dispara o handoff e entrega o resumo gerado pela IA', async () => {
    aiMasterMock.assumirComoMestre.mockResolvedValue({ resumo: 'O grupo enfrentou o dragão e recuou para a vila.' })
    const onHandoffConcluido = vi.fn()
    const user = userEvent.setup()
    render(<AssumirMestreConfirm campanhaId="camp-1" onHandoffConcluido={onHandoffConcluido} />)

    await user.click(screen.getByRole('button', { name: 'Assumir como mestre' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar — assumir como mestre' }))

    expect(aiMasterMock.assumirComoMestre).toHaveBeenCalledWith('camp-1')
    await waitFor(() =>
      expect(onHandoffConcluido).toHaveBeenCalledWith('O grupo enfrentou o dragão e recuou para a vila.'),
    )
  })

  it('mostra uma mensagem de erro e permite tentar novamente se o handoff falhar', async () => {
    aiMasterMock.assumirComoMestre.mockRejectedValue(new Error('falhou'))
    const user = userEvent.setup()
    render(<AssumirMestreConfirm campanhaId="camp-1" onHandoffConcluido={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Assumir como mestre' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar — assumir como mestre' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/não foi possível/i)
    expect(screen.getByRole('button', { name: 'Confirmar — assumir como mestre' })).toBeEnabled()
  })
})
