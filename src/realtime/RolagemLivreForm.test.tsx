import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RolagemLivreForm } from './RolagemLivreForm'

describe('RolagemLivreForm', () => {
  it('bloqueia o envio com notação inválida e não chama onRolar', async () => {
    const user = userEvent.setup()
    const onRolar = vi.fn()
    render(<RolagemLivreForm onRolar={onRolar} />)

    await user.type(screen.getByLabelText('Rolagem livre'), '2x6')
    await user.click(screen.getByRole('button', { name: 'Rolar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/notação de dados inválida/i)
    expect(onRolar).not.toHaveBeenCalled()
  })

  it('envia a rolagem quando a notação é válida e limpa o campo', async () => {
    const user = userEvent.setup()
    const onRolar = vi.fn().mockResolvedValue({})
    render(<RolagemLivreForm onRolar={onRolar} />)

    const input = screen.getByLabelText('Rolagem livre')
    await user.type(input, '2d6+3')
    await user.click(screen.getByRole('button', { name: 'Rolar' }))

    expect(onRolar).toHaveBeenCalledWith('2d6+3')
    expect(await screen.findByLabelText('Rolagem livre')).toHaveValue('')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('mostra erro quando o envio falha, sem travar o formulário', async () => {
    const user = userEvent.setup()
    const onRolar = vi.fn().mockRejectedValue(new Error('falhou'))
    render(<RolagemLivreForm onRolar={onRolar} />)

    await user.type(screen.getByLabelText('Rolagem livre'), '1d20')
    await user.click(screen.getByRole('button', { name: 'Rolar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/não foi possível enviar/i)
  })
})
