import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RolagemLivreForm } from './RolagemLivreForm'

describe('RolagemLivreForm', () => {
  it('bloqueia o envio com notação inválida e não chama onRolar', async () => {
    const user = userEvent.setup()
    const onRolar = vi.fn()
    render(<RolagemLivreForm onRolar={onRolar} />)

    await user.type(screen.getByLabelText(/notação/i), '2x6')
    await user.click(screen.getByRole('button', { name: 'Rolar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/notação de dados inválida/i)
    expect(onRolar).not.toHaveBeenCalled()
  })

  it('envia a rolagem quando a notação é válida e limpa o campo', async () => {
    const user = userEvent.setup()
    const onRolar = vi.fn().mockResolvedValue({})
    render(<RolagemLivreForm onRolar={onRolar} />)

    const input = screen.getByLabelText(/notação/i)
    await user.type(input, '2d6+3')
    await user.click(screen.getByRole('button', { name: 'Rolar' }))

    expect(onRolar).toHaveBeenCalledWith('2d6+3')
    expect(await screen.findByLabelText(/notação/i)).toHaveValue('')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('mostra "Enviando…" enquanto aguarda o ack do servidor', async () => {
    const user = userEvent.setup()
    let resolver: (value: unknown) => void = () => {}
    const onRolar = vi.fn().mockReturnValue(new Promise((resolve) => (resolver = resolve)))
    render(<RolagemLivreForm onRolar={onRolar} />)

    await user.type(screen.getByLabelText(/notação/i), '1d20')
    await user.click(screen.getByRole('button', { name: 'Rolar' }))

    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled()
    resolver({})
    // O rótulo volta a "Rolar" (não trava em "Enviando…"); o botão continua
    // desabilitado porque o campo foi limpo após o envio, não por estar travado.
    expect(await screen.findByRole('button', { name: 'Rolar' })).toBeInTheDocument()
  })

  it('avisa o chamador quando o envio falha, sem travar o formulário', async () => {
    const user = userEvent.setup()
    const onRolar = vi.fn().mockRejectedValue(new Error('falhou'))
    const onErroEnvio = vi.fn()
    render(<RolagemLivreForm onRolar={onRolar} onErroEnvio={onErroEnvio} />)

    await user.type(screen.getByLabelText(/notação/i), '1d20')
    await user.click(screen.getByRole('button', { name: 'Rolar' }))

    await screen.findByRole('button', { name: 'Rolar' })
    expect(onErroEnvio).toHaveBeenCalledWith('Não foi possível enviar a rolagem.')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
