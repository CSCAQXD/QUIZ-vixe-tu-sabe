import { useState } from 'react'

import Button from '../../components/common/Button/Button'
import FormField from '../../components/common/FormField/FormField'
import HomeButton from '../../components/common/HomeButton/HomeButton'
import ScenicBackdrop from '../../components/common/ScenicBackdrop/ScenicBackdrop'
import {
  ativarVersaoPerguntas,
  consultarStatusPerguntas,
  validarPlanilhaPerguntas,
} from '../../api/perguntaAdminApi'
import { getUserErrorMessage } from '../../utils/errors'

import './PerguntasAdminPage.css'

function formatarData(valor) {
  if (!valor) return 'Ainda não ativada'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(valor),
  )
}

function PerguntasAdminPage() {
  const [token, setToken] = useState('')
  const [status, setStatus] = useState(null)
  const [candidata, setCandidata] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function executar(acao) {
    setCarregando(true)
    setErro('')
    setMensagem('')
    try {
      return await acao()
    } catch (falha) {
      setErro(
        getUserErrorMessage(
          falha,
          'Não foi possível concluir esta operação. Tente novamente em alguns instantes.',
        ),
      )
      return null
    } finally {
      setCarregando(false)
    }
  }

  async function entrar(event) {
    event.preventDefault()
    const dados = await executar(() => consultarStatusPerguntas(token))
    if (dados) setStatus(dados)
  }

  async function validarPlanilha() {
    const resultado = await executar(() => validarPlanilhaPerguntas(token))
    if (!resultado) return

    if (resultado.resultado === 'SEM_ALTERACOES') {
      setCandidata(null)
      setMensagem('A planilha está igual à versão ativa. Nenhuma publicação é necessária.')
      return
    }

    setCandidata(resultado)
    setMensagem('Planilha validada. Revise o resumo antes de publicar.')
  }

  async function ativar(versaoId) {
    const resultado = await executar(() => ativarVersaoPerguntas(token, versaoId))
    if (!resultado) return

    setCandidata(null)
    setMensagem(resultado.mensagem)
    const atualizado = await executar(() => consultarStatusPerguntas(token))
    if (atualizado) setStatus(atualizado)
  }

  if (!status) {
    return (
      <section className="perguntas-admin perguntas-admin--login">
        <img
          alt=""
          aria-hidden="true"
          className="perguntas-admin__login-sun"
          src="/assets/illustrations/sol.svg"
        />

        <div className="perguntas-admin__panel perguntas-admin__login-card">
          <img
            alt="Vixe, Tu Sabe?"
            className="perguntas-admin__login-logo"
            src="/assets/brand/vixe-tu-sabe.svg"
          />

          <div aria-hidden="true" className="perguntas-admin__lock">
            <svg fill="none" viewBox="0 0 32 32">
              <path
                d="M10 14v-3a6 6 0 0 1 12 0v3m-13 0h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V16a2 2 0 0 1 2-2Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
              />
              <path d="M16 20v3" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
            </svg>
          </div>

          <p className="perguntas-admin__eyebrow">Acesso da equipe</p>
          <h1>Banco de perguntas</h1>
          <p className="perguntas-admin__login-description">
            Entre para revisar e publicar alterações feitas na planilha.
          </p>
          <form className="perguntas-admin__login-form" onSubmit={entrar}>
            <FormField
              id="token-perguntas"
              label="Senha administrativa"
              onChange={setToken}
              required
              type="password"
              value={token}
            />
            {erro && <p className="perguntas-admin__error">{erro}</p>}
            <div className="perguntas-admin__login-actions">
              <HomeButton />
              <Button disabled={carregando || token.length < 16} type="submit">
                {carregando ? 'Verificando...' : 'Entrar'}
              </Button>
            </div>
          </form>
        </div>

        <ScenicBackdrop
          fenceClassName="perguntas-admin__login-fence"
          groundClassName="perguntas-admin__login-ground"
        />
      </section>
    )
  }

  return (
    <section className="perguntas-admin">
      <header className="perguntas-admin__header">
        <div>
          <p className="perguntas-admin__eyebrow">Casa de Saberes Cego Aderaldo</p>
          <h1>Banco de perguntas</h1>
          <p>O quiz usa a versão ativa no servidor, mesmo quando a internet está indisponível.</p>
        </div>
        <div className="perguntas-admin__actions">
          <HomeButton />
          <Button disabled={carregando} onClick={validarPlanilha}>
            {carregando ? 'Verificando...' : 'Verificar alterações'}
          </Button>
        </div>
      </header>

      {erro && <p className="perguntas-admin__error">{erro}</p>}
      {mensagem && <p className="perguntas-admin__message">{mensagem}</p>}

      <article className="perguntas-admin__panel">
        <h2>Versão ativa</h2>
        {status.ativa ? (
          <dl className="perguntas-admin__summary">
            <div>
              <dt>Perguntas</dt>
              <dd>{status.ativa.total}</dd>
            </div>
            <div>
              <dt>Ativada em</dt>
              <dd>{formatarData(status.ativa.ativadaEm)}</dd>
            </div>
            <div>
              <dt>Identificação</dt>
              <dd>{status.ativa.id.slice(0, 8)}</dd>
            </div>
          </dl>
        ) : (
          <p>Nenhuma versão foi ativada ainda.</p>
        )}
      </article>

      {candidata && (
        <article className="perguntas-admin__panel perguntas-admin__candidate">
          <h2>Alterações encontradas</h2>
          <dl className="perguntas-admin__summary">
            <div>
              <dt>Adicionadas</dt>
              <dd>{candidata.diferencas.totais.adicionadas}</dd>
            </div>
            <div>
              <dt>Alteradas</dt>
              <dd>{candidata.diferencas.totais.alteradas}</dd>
            </div>
            <div>
              <dt>Removidas</dt>
              <dd>{candidata.diferencas.totais.removidas}</dd>
            </div>
            <div>
              <dt>Total novo</dt>
              <dd>{candidata.versao.total}</dd>
            </div>
          </dl>
          <p>A versão ativa permanecerá disponível caso seja necessário restaurá-la.</p>
          <Button
            disabled={carregando}
            onClick={() => ativar(candidata.versao.id)}
            variant="success"
          >
            Publicar atualização
          </Button>
        </article>
      )}

      <article className="perguntas-admin__panel">
        <h2>Histórico</h2>
        <div className="perguntas-admin__history">
          {status.versoes.map((versao) => (
            <div className="perguntas-admin__version" key={versao.id}>
              <div>
                <strong>{versao.total} perguntas</strong>
                <span>{formatarData(versao.ativadaEm || versao.criadaEm)}</span>
                <span>{versao.status}</span>
              </div>
              {versao.status !== 'ATIVA' && (
                <Button disabled={carregando} onClick={() => ativar(versao.id)} variant="secondary">
                  {versao.status === 'RASCUNHO' ? 'Publicar' : 'Restaurar'}
                </Button>
              )}
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}

export default PerguntasAdminPage
