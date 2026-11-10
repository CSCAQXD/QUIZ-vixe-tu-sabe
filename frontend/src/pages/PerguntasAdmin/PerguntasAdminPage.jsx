import { useState } from 'react'

import Button from '../../components/common/Button/Button'
import FormField from '../../components/common/FormField/FormField'
import HomeButton from '../../components/common/HomeButton/HomeButton'
import ScenicBackdrop from '../../components/common/ScenicBackdrop/ScenicBackdrop'
import {
  ativarVersaoPerguntas,
  consultarStatusPerguntas,
  validarArquivoPerguntas,
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
  const [arquivo, setArquivo] = useState(null)

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

  async function validarArquivo() {
    if (!arquivo) {
      setErro('Escolha primeiro o arquivo CSV com as perguntas.')
      return
    }

    if (arquivo.size > 2 * 1024 * 1024) {
      setErro('O arquivo é muito grande. O limite é 2 MB.')
      return
    }

    const conteudoCsv = await arquivo.text()
    const resultado = await executar(() => validarArquivoPerguntas(token, conteudoCsv))
    if (!resultado) return

    if (resultado.resultado === 'SEM_ALTERACOES') {
      setCandidata(null)
      setMensagem('O arquivo está igual à versão ativa. Nenhuma publicação é necessária.')
      return
    }

    setCandidata(resultado)
    setMensagem('Arquivo validado. Revise o resumo antes de publicar.')
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
            Entre para revisar e publicar novas versões das perguntas.
          </p>
          <form className="perguntas-admin__login-form" onSubmit={entrar}>
            <FormField
              id="token-perguntas"
              label="Senha administrativa"
              onChange={setToken}
              revealable
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
    <section className="perguntas-admin perguntas-admin--dashboard">
      <img
        alt=""
        aria-hidden="true"
        className="perguntas-admin__dashboard-sun"
        src="/assets/illustrations/sol.svg"
      />

      <div className="perguntas-admin__content">
        <header className="perguntas-admin__header">
          <img
            alt="Vixe, Tu Sabe?"
            className="perguntas-admin__header-logo"
            src="/assets/brand/vixe-tu-sabe.svg"
          />
          <div className="perguntas-admin__heading">
            <p className="perguntas-admin__eyebrow">Área da equipe</p>
            <h1>Banco de perguntas</h1>
            <p>Atualize o conteúdo com segurança e mantenha o quiz pronto para jogar.</p>
          </div>
          <div className="perguntas-admin__actions">
            <HomeButton />
          </div>
        </header>

        <div aria-live="polite">
          {erro && <p className="perguntas-admin__notice perguntas-admin__error">{erro}</p>}
          {mensagem && (
            <p className="perguntas-admin__notice perguntas-admin__message">{mensagem}</p>
          )}
        </div>

        <main className="perguntas-admin__main">
          <article className="perguntas-admin__active">
            <span aria-hidden="true" className="perguntas-admin__active-check">
              ✓
            </span>
            <div className="perguntas-admin__active-copy">
              <h2>{status.ativa ? 'Quiz pronto para jogar' : 'Aguardando publicação'}</h2>
              <p>
                {status.ativa
                  ? `Versão publicada em ${formatarData(status.ativa.ativadaEm)} e disponível mesmo sem internet.`
                  : 'Envie o primeiro arquivo para disponibilizar as perguntas.'}
              </p>
            </div>
            {status.ativa && (
              <div className="perguntas-admin__active-total">
                <strong>{status.ativa.total}</strong>
                <span>perguntas</span>
              </div>
            )}
          </article>

          <article className="perguntas-admin__panel perguntas-admin__upload">
            <div className="perguntas-admin__panel-heading">
              <div>
                <p className="perguntas-admin__step">Atualizar conteúdo</p>
                <h2>Envie uma nova planilha</h2>
              </div>
            </div>
            <p className="perguntas-admin__panel-description">
              Baixe a planilha privada como CSV. O arquivo será conferido antes de qualquer mudança.
            </p>
            <div className="perguntas-admin__upload-actions">
              <label className="perguntas-admin__file">
                <span className="perguntas-admin__file-title">
                  {arquivo ? arquivo.name : 'Escolher arquivo CSV'}
                </span>
                <span className="perguntas-admin__file-hint">
                  {arquivo ? 'Clique para escolher outro' : 'Tamanho máximo: 2 MB'}
                </span>
                <input
                  accept=".csv,text/csv"
                  onChange={(event) => {
                    setArquivo(event.target.files?.[0] ?? null)
                    setCandidata(null)
                    setErro('')
                    setMensagem('')
                  }}
                  type="file"
                />
              </label>
              <Button disabled={carregando || !arquivo} onClick={validarArquivo}>
                {carregando ? 'Verificando...' : 'Verificar arquivo'}
              </Button>
            </div>
          </article>

          {candidata && (
            <article className="perguntas-admin__panel perguntas-admin__candidate">
              <div className="perguntas-admin__panel-heading">
                <span aria-hidden="true" className="perguntas-admin__panel-icon">
                  ✓
                </span>
                <div>
                  <p className="perguntas-admin__step">Revisão</p>
                  <h2>Alterações encontradas</h2>
                </div>
              </div>
              <dl className="perguntas-admin__summary perguntas-admin__summary--changes">
                <div>
                  <dt>Adicionadas</dt>
                  <dd>+{candidata.diferencas.totais.adicionadas}</dd>
                </div>
                <div>
                  <dt>Alteradas</dt>
                  <dd>{candidata.diferencas.totais.alteradas}</dd>
                </div>
                <div>
                  <dt>Removidas</dt>
                  <dd>−{candidata.diferencas.totais.removidas}</dd>
                </div>
                <div>
                  <dt>Total novo</dt>
                  <dd>{candidata.versao.total}</dd>
                </div>
              </dl>
              <div className="perguntas-admin__candidate-footer">
                <p>A versão atual fica salva no histórico e poderá ser restaurada.</p>
                <Button
                  disabled={carregando}
                  onClick={() => ativar(candidata.versao.id)}
                  variant="success"
                >
                  Publicar atualização
                </Button>
              </div>
            </article>
          )}

          <article className="perguntas-admin__panel perguntas-admin__history-panel">
            <div className="perguntas-admin__panel-heading">
              <div>
                <p className="perguntas-admin__step">Segurança</p>
                <h2>Histórico de versões</h2>
              </div>
            </div>
            <div className="perguntas-admin__history">
              {status.versoes.map((versao) => (
                <div className="perguntas-admin__version" key={versao.id}>
                  <div className="perguntas-admin__version-info">
                    <strong>{versao.total} perguntas</strong>
                    <span>{formatarData(versao.ativadaEm || versao.criadaEm)}</span>
                  </div>
                  <span
                    className={`perguntas-admin__badge ${
                      versao.status === 'ATIVA' ? 'perguntas-admin__badge--active' : ''
                    }`}
                  >
                    {versao.status === 'ATIVA' ? 'Publicada' : versao.status.toLowerCase()}
                  </span>
                  {versao.status !== 'ATIVA' && (
                    <Button
                      disabled={carregando}
                      onClick={() => ativar(versao.id)}
                      variant="secondary"
                    >
                      {versao.status === 'RASCUNHO' ? 'Publicar' : 'Restaurar'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </article>
        </main>
      </div>

      <ScenicBackdrop
        fenceClassName="perguntas-admin__dashboard-fence"
        groundClassName="perguntas-admin__dashboard-ground"
      />
    </section>
  )
}

export default PerguntasAdminPage
