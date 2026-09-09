import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { criarElemento, editarElemento, listarElementosDoMundo, listarMundos, publicarElemento } from '../api/worlds'
import type { ElementoHistoria, Mundo } from '../api/types'

const STATUS_LABEL: Record<ElementoHistoria['status'], string> = {
  rascunho: 'Rascunho',
  publicado: 'Publicado',
}

export function WorldPage() {
  const { mundoId } = useParams<{ mundoId: string }>()
  const [mundo, setMundo] = useState<Mundo | null>(null)
  const [elementos, setElementos] = useState<ElementoHistoria[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [elementoEditando, setElementoEditando] = useState<ElementoHistoria | null>(null)
  const [titulo, setTitulo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [publicandoId, setPublicandoId] = useState<string | null>(null)
  const erroFormRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (erroForm) erroFormRef.current?.focus()
  }, [erroForm])

  function carregar() {
    if (!mundoId) return
    setErro(null)
    setMundo(null)
    setElementos(null)
    Promise.all([listarMundos(), listarElementosDoMundo(mundoId)])
      .then(([mundos, elementosDoMundo]) => {
        setMundo(mundos.find((m) => m.id === mundoId) ?? null)
        setElementos(elementosDoMundo)
      })
      .catch(() => setErro('Não foi possível carregar este mundo.'))
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mundoId])

  function iniciarEdicao(elemento: ElementoHistoria) {
    setElementoEditando(elemento)
    setTitulo(elemento.titulo)
    setCategoria(elemento.categoria)
    setConteudo(elemento.conteudo)
    setErroForm(null)
  }

  function cancelarEdicao() {
    setElementoEditando(null)
    setTitulo('')
    setCategoria('')
    setConteudo('')
    setErroForm(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !conteudo.trim()) {
      setErroForm('Título e conteúdo são obrigatórios.')
      return
    }
    setErroForm(null)
    setSalvando(true)
    try {
      const dados = { titulo: titulo.trim(), categoria: categoria.trim(), conteudo: conteudo.trim() }
      if (elementoEditando && mundoId) {
        const atualizado = await editarElemento(mundoId, elementoEditando.id, dados)
        setElementos((atual) => (atual ? atual.map((el) => (el.id === atualizado.id ? atualizado : el)) : atual))
      } else if (mundoId) {
        const criado = await criarElemento(mundoId, dados)
        setElementos((atual) => (atual ? [...atual, criado] : [criado]))
      }
      cancelarEdicao()
    } catch {
      setErroForm('Não foi possível salvar o elemento agora. Tente novamente em instantes.')
    } finally {
      setSalvando(false)
    }
  }

  async function handlePublicar(elementoId: string) {
    if (!mundoId) return
    setPublicandoId(elementoId)
    try {
      const atualizado = await publicarElemento(mundoId, elementoId)
      setElementos((atual) => (atual ? atual.map((el) => (el.id === atualizado.id ? atualizado : el)) : atual))
    } catch {
      setErro('Não foi possível publicar este elemento.')
    } finally {
      setPublicandoId(null)
    }
  }

  if (!mundoId) return null

  if (erro && !elementos) {
    return (
      <main className="campaigns-screen">
        <section className="campaigns-screen__panel">
          <p role="alert" className="campaigns-screen__error">
            {erro}
            <button type="button" className="campaigns-screen__retry" onClick={carregar}>
              Tentar novamente
            </button>
          </p>
        </section>
      </main>
    )
  }

  if (!elementos) {
    return (
      <main className="campaigns-screen">
        <section className="campaigns-screen__panel">
          <p className="campaigns-screen__hint">Carregando mundo…</p>
        </section>
      </main>
    )
  }

  return (
    <main className="campaigns-screen">
      <header className="campaigns-screen__masthead">
        <h1 id="mundo-heading">{mundo?.nome ?? 'Mundo'}</h1>
        <Link to="/mundos" className="campaigns-screen__logout">
          Voltar aos mundos
        </Link>
      </header>

      {erro && (
        <p role="alert" className="campaigns-screen__error">
          {erro}
        </p>
      )}

      <section className="campaigns-screen__panel" aria-labelledby="elementos-heading">
        <h2 id="elementos-heading" className="campaigns-screen__section-title">
          Elementos de história
        </h2>

        {elementos.length === 0 && (
          <p className="campaigns-screen__empty">Nenhum elemento de história criado ainda neste mundo.</p>
        )}
        {elementos.length > 0 && (
          <ul className="campaigns-screen__list campaigns-screen__list--open">
            {elementos.map((elemento) => (
              <li key={elemento.id}>
                <div className="campaigns-screen__entry-info">
                  <span className="campaigns-screen__entry-name">{elemento.titulo}</span>
                  <span className="campaigns-screen__entry-meta">{elemento.categoria}</span>
                </div>
                <span className={`campaigns-screen__status-pill campaigns-screen__status-pill--${elemento.status}`}>
                  {STATUS_LABEL[elemento.status]}
                </span>
                <button type="button" className="campaigns-screen__retry" onClick={() => iniciarEdicao(elemento)}>
                  Editar
                </button>
                {elemento.status === 'rascunho' && (
                  <button
                    type="button"
                    className="campaigns-screen__join"
                    disabled={publicandoId === elemento.id}
                    onClick={() => handlePublicar(elemento.id)}
                  >
                    {publicandoId === elemento.id ? 'Publicando…' : 'Publicar'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="campaigns-screen__panel" aria-labelledby="elemento-form-heading">
        <h2 id="elemento-form-heading" className="campaigns-screen__section-title">
          {elementoEditando ? `Editar "${elementoEditando.titulo}"` : 'Criar elemento'}
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-screen__field">
            <label htmlFor="elemento-titulo">Título</label>
            <input
              id="elemento-titulo"
              required
              maxLength={120}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="auth-screen__field">
            <label htmlFor="elemento-categoria">Categoria</label>
            <input
              id="elemento-categoria"
              placeholder="Ex: Divindade, Local, História"
              maxLength={60}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />
          </div>

          <div className="auth-screen__field">
            <label htmlFor="elemento-conteudo">Conteúdo</label>
            <textarea
              id="elemento-conteudo"
              rows={8}
              required
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
            />
          </div>

          {erroForm && (
            <p ref={erroFormRef} role="alert" tabIndex={-1} className="auth-screen__error">
              {erroForm}
            </p>
          )}

          <button type="submit" className="campaigns-screen__join" disabled={salvando}>
            {salvando ? 'Salvando…' : elementoEditando ? 'Salvar alterações' : 'Criar elemento'}
          </button>
          {elementoEditando && (
            <button type="button" className="campaigns-screen__logout" onClick={cancelarEdicao}>
              Cancelar edição
            </button>
          )}
        </form>
      </section>
    </main>
  )
}
