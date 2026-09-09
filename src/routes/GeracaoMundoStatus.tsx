/**
 * Tela de acompanhamento da geração assíncrona de mundo (`ai-world-generation`).
 * Não navega para a campanha enquanto a geração não termina; em caso de
 * falha, exibe a mensagem sem navegar.
 */
export function GeracaoMundoStatus({ erro }: { erro?: string }) {
  return (
    <main className="campaigns-screen">
      <header className="campaigns-screen__masthead">
        <h1 id="geracao-mundo-heading">Gerando seu mundo…</h1>
      </header>

      <section className="campaigns-screen__panel" aria-labelledby="geracao-mundo-heading">
        {erro ? (
          <p role="alert" className="campaigns-screen__error">
            {erro}
          </p>
        ) : (
          <p className="campaigns-screen__hint" role="status">
            A IA está gerando o mundo, a lore e o arco inicial da sua campanha. Isso pode levar alguns minutos — você
            pode voltar à lista de campanhas e conferir mais tarde.
          </p>
        )}
      </section>
    </main>
  )
}
