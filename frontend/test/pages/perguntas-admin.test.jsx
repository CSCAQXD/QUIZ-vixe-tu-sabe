import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import PerguntasAdminPage from '../../src/pages/PerguntasAdmin/PerguntasAdminPage'
import { UserFacingError } from '../../src/utils/errors'
import {
  ativarVersaoPerguntas,
  consultarStatusPerguntas,
  consultarVersaoPerguntas,
  descartarVersaoPerguntas,
  exportarRankings,
  reiniciarRankings,
  validarArquivoPerguntas,
} from '../../src/api/perguntaAdminApi'

vi.mock('../../src/api/perguntaAdminApi', () => ({
  ativarVersaoPerguntas: vi.fn(),
  consultarStatusPerguntas: vi.fn(),
  consultarVersaoPerguntas: vi.fn(),
  descartarVersaoPerguntas: vi.fn(),
  exportarRankings: vi.fn(),
  reiniciarRankings: vi.fn(),
  validarArquivoPerguntas: vi.fn(),
}))

const status = {
  ativa: {
    id: 'versao-ativa',
    total: 50,
    status: 'ATIVA',
    criadaEm: '2026-11-03T10:00:00.000Z',
    ativadaEm: '2026-11-03T10:01:00.000Z',
  },
  versoes: [
    {
      id: 'versao-ativa',
      hash: 'ativa123456789',
      total: 50,
      status: 'ATIVA',
      criadaEm: '2026-11-03T10:00:00.000Z',
      ativadaEm: '2026-11-03T10:01:00.000Z',
    },
    {
      id: 'versao-arquivada',
      hash: 'anterior123456789',
      total: 48,
      status: 'ARQUIVADA',
      criadaEm: '2026-10-20T10:00:00.000Z',
      ativadaEm: '2026-10-20T10:01:00.000Z',
    },
  ],
}

function renderPage() {
  return render(
    <MemoryRouter>
      <PerguntasAdminPage />
    </MemoryRouter>,
  )
}

describe('administração das perguntas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    consultarStatusPerguntas.mockResolvedValue(status)
  })

  it('exige a senha e apresenta a versão ativa', async () => {
    const user = userEvent.setup()
    renderPage()

    const passwordField = screen.getByLabelText('Senha administrativa')
    expect(passwordField).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(passwordField).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar senha' })).toBeVisible()

    fireEvent.change(passwordField, {
      target: { value: 'token-administrativo-com-32-caracteres' },
    })
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('heading', { name: 'Banco de perguntas' })).toBeVisible()
    expect(screen.getByText('50')).toBeVisible()
    expect(consultarStatusPerguntas).toHaveBeenCalledWith('token-administrativo-com-32-caracteres')
  })

  it('permite conferir uma senha curta e abre aviso quando ela está incorreta', async () => {
    const user = userEvent.setup()
    consultarStatusPerguntas.mockRejectedValue(
      new UserFacingError('Senha administrativa inválida.', { status: 401 }),
    )
    renderPage()

    const entrar = screen.getByRole('button', { name: 'Entrar' })
    expect(entrar).toBeDisabled()

    await user.type(screen.getByLabelText('Senha administrativa'), 'errada')
    expect(entrar).toBeEnabled()
    await user.click(entrar)

    expect(await screen.findByRole('dialog', { name: 'Senha incorreta' })).toBeVisible()
    expect(screen.getByText(/não confere/i)).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Entendi' }))
    expect(screen.queryByRole('dialog', { name: 'Senha incorreta' })).not.toBeInTheDocument()
  })

  it('mostra os demais erros em um pop-up', async () => {
    const user = userEvent.setup()
    consultarStatusPerguntas.mockRejectedValue(
      new UserFacingError('Não foi possível conectar ao servidor.', { status: 503 }),
    )
    renderPage()

    await user.type(screen.getByLabelText('Senha administrativa'), 'qualquer')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('dialog', { name: 'Não foi possível entrar' })).toBeVisible()
    expect(
      screen.queryByText('Não foi possível conectar ao servidor.', { selector: 'p' }),
    ).toBeVisible()
  })

  it('mostra as diferenças e só publica após confirmação', async () => {
    const user = userEvent.setup()
    validarArquivoPerguntas.mockResolvedValue({
      resultado: 'VERSAO_PRONTA',
      versao: { id: 'candidata', total: 51, status: 'RASCUNHO' },
      diferencas: { totais: { adicionadas: 2, alteradas: 1, removidas: 1 } },
    })
    ativarVersaoPerguntas.mockResolvedValue({
      mensagem: 'Versão de perguntas ativada com sucesso.',
    })
    renderPage()

    fireEvent.change(screen.getByLabelText('Senha administrativa'), {
      target: { value: 'token-administrativo-com-32-caracteres' },
    })
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    const arquivo = new File(['id,faixa,tema'], 'perguntas.csv', { type: 'text/csv' })
    await user.upload(await screen.findByLabelText(/Escolher arquivo CSV/), arquivo)
    await user.click(screen.getByRole('button', { name: 'Verificar arquivo' }))

    expect(await screen.findByRole('heading', { name: 'Alterações encontradas' })).toBeVisible()
    expect(validarArquivoPerguntas).toHaveBeenCalledWith(
      'token-administrativo-com-32-caracteres',
      'id,faixa,tema',
    )
    expect(ativarVersaoPerguntas).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Publicar atualização' }))
    expect(ativarVersaoPerguntas).toHaveBeenCalledWith(
      'token-administrativo-com-32-caracteres',
      'candidata',
    )
  })

  it('visualiza uma versão anterior e filtra as perguntas', async () => {
    const user = userEvent.setup()
    consultarVersaoPerguntas.mockResolvedValue({
      versao: {
        ...status.versoes[1],
        perguntas: [
          {
            id: 'P-ORIGENS',
            faixa: 'FUNDAMENTAL_1',
            tema: 'Origens e caminhos',
            pergunta: 'Onde nasceu Cego Aderaldo?',
            opcoes: ['Quixadá', 'Crato', 'Sobral', 'Fortaleza'],
            correta: 'A',
            pontosIniciais: 100,
            dicas: ['Fica no Sertão Central.'],
          },
          {
            id: 'P-MUSICA',
            faixa: 'TODAS',
            tema: 'Arte e música',
            pergunta: 'Qual instrumento aparece na narrativa?',
            opcoes: ['Cavaquinho', 'Piano', 'Flauta', 'Violino'],
            correta: 'A',
            pontosIniciais: 100,
            dicas: [],
          },
        ],
      },
    })
    renderPage()

    fireEvent.change(screen.getByLabelText('Senha administrativa'), {
      target: { value: 'token-administrativo-com-32-caracteres' },
    })
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    const versaoAnterior = screen
      .getByText('Identificação anterior')
      .closest('.perguntas-admin__version')
    await user.click(within(versaoAnterior).getByRole('button', { name: 'Visualizar' }))

    expect(consultarVersaoPerguntas).toHaveBeenCalledWith(
      'token-administrativo-com-32-caracteres',
      'versao-arquivada',
    )
    expect(await screen.findByText('Onde nasceu Cego Aderaldo?')).toBeVisible()
    expect(screen.getByText('Qual instrumento aparece na narrativa?')).toBeVisible()
    expect(screen.getAllByRole('option', { name: 'Todas as faixas' })).toHaveLength(1)

    await user.selectOptions(screen.getByLabelText('Tema'), 'Arte e música')
    expect(screen.queryByText('Onde nasceu Cego Aderaldo?')).not.toBeInTheDocument()
    expect(screen.getByText('Qual instrumento aparece na narrativa?')).toBeVisible()

    await user.selectOptions(screen.getByLabelText('Tema'), 'TODOS')
    await user.type(screen.getByLabelText('Buscar'), 'Quixadá')
    expect(screen.getByText('Onde nasceu Cego Aderaldo?')).toBeVisible()
    expect(screen.queryByText('Qual instrumento aparece na narrativa?')).not.toBeInTheDocument()
  })

  it('descarta somente uma versão anterior após confirmar a senha', async () => {
    const user = userEvent.setup()
    descartarVersaoPerguntas.mockResolvedValue({ mensagem: 'Versão descartada definitivamente.' })
    consultarStatusPerguntas
      .mockResolvedValueOnce(status)
      .mockResolvedValueOnce({ ...status, versoes: [status.versoes[0]] })
    renderPage()

    fireEvent.change(screen.getByLabelText('Senha administrativa'), {
      target: { value: 'token-administrativo-com-32-caracteres' },
    })
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    const versaoAnterior = screen
      .getByText('Identificação anterior')
      .closest('.perguntas-admin__version')
    expect(
      within(
        screen.getByText('Identificação ativa123').closest('.perguntas-admin__version'),
      ).queryByRole('button', { name: 'Descartar' }),
    ).not.toBeInTheDocument()
    await user.click(within(versaoAnterior).getByRole('button', { name: 'Descartar' }))

    const confirmacao = screen.getByRole('dialog', { name: 'Descartar esta versão?' })
    fireEvent.change(within(confirmacao).getByLabelText('Confirme a senha administrativa'), {
      target: { value: 'token-administrativo-com-32-caracteres' },
    })
    await user.click(within(confirmacao).getByRole('button', { name: 'Descartar definitivamente' }))

    expect(descartarVersaoPerguntas).toHaveBeenCalledWith(
      'token-administrativo-com-32-caracteres',
      'versao-arquivada',
      'token-administrativo-com-32-caracteres',
    )
    expect(await screen.findByRole('dialog', { name: 'Versão descartada' })).toBeVisible()
    expect(screen.queryByText('Identificação anterior')).not.toBeInTheDocument()
  })

  it('exporta os rankings e exige senha e frase para reiniciar o ano', async () => {
    const user = userEvent.setup()
    const ano = new Date().getFullYear()
    const criarEndereco = vi.fn(() => 'blob:rankings')
    const revogarEndereco = vi.fn()
    const clicarLink = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: criarEndereco })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revogarEndereco })
    exportarRankings.mockResolvedValue({
      arquivo: new Blob(['planilha']),
      nome: `vixe-tu-sabe-rankings-${ano}.xlsx`,
    })
    reiniciarRankings.mockResolvedValue({ mensagem: `Os dados de ${ano} foram apagados.` })
    renderPage()

    fireEvent.change(screen.getByLabelText('Senha administrativa'), {
      target: { value: 'token-administrativo-com-32-caracteres' },
    })
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    await user.click(await screen.findByRole('button', { name: `Exportar rankings de ${ano}` }))
    expect(exportarRankings).toHaveBeenCalledWith('token-administrativo-com-32-caracteres', ano)
    expect(clicarLink).toHaveBeenCalledOnce()

    expect(screen.queryByLabelText('Confirme a senha administrativa')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: `Reiniciar rankings de ${ano}` }))
    const confirmacao = screen.getByRole('dialog', { name: `Reiniciar rankings de ${ano}?` })
    expect(confirmacao).toBeVisible()
    fireEvent.change(within(confirmacao).getByLabelText('Confirme a senha administrativa'), {
      target: { value: 'token-administrativo-com-32-caracteres' },
    })
    fireEvent.change(within(confirmacao).getByLabelText(`Digite: APAGAR DADOS DE ${ano}`), {
      target: { value: `APAGAR DADOS DE ${ano}` },
    })
    const apagar = within(confirmacao).getByRole('button', { name: `Apagar dados de ${ano}` })
    expect(apagar).toBeEnabled()
    await user.click(apagar)

    expect(reiniciarRankings).toHaveBeenCalledWith(
      'token-administrativo-com-32-caracteres',
      ano,
      'token-administrativo-com-32-caracteres',
      `APAGAR DADOS DE ${ano}`,
    )
    expect(
      screen.queryByRole('dialog', { name: `Reiniciar rankings de ${ano}?` }),
    ).not.toBeInTheDocument()
    const sucesso = await screen.findByRole('dialog', { name: 'Rankings reiniciados' })
    expect(within(sucesso).getByText(`Os dados de ${ano} foram apagados.`)).toBeVisible()

    await user.click(within(sucesso).getByRole('button', { name: 'Concluir' }))
    expect(screen.queryByRole('dialog', { name: 'Rankings reiniciados' })).not.toBeInTheDocument()
  })
})
