import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import QuizPage from '../../src/pages/Quiz/QuizPage'
import { carregarQuiz } from '../../src/api/perguntaApi'
import { registrarSessao } from '../../src/api/sessaoApi'
import { getResult, saveMediation } from '../../src/utils/storage'

vi.mock('../../src/api/perguntaApi', () => ({ carregarQuiz: vi.fn() }))
vi.mock('../../src/api/sessaoApi', () => ({ registrarSessao: vi.fn() }))
vi.mock('../../src/components/features/quiz/QuizBoard/QuizBoard', () => ({
  default: ({ currentQuestion, onSelectAnswer, onConfirm, onNext }) => (
    <div>
      <h1>{currentQuestion.pergunta}</h1>
      <button onClick={() => onSelectAnswer(0)}>Selecionar A</button>
      <button onClick={onConfirm}>Confirmar</button>
      <button onClick={onNext}>Avançar</button>
    </div>
  ),
}))
const medio = { etapaEnsino: 'MEDIO', serie: 3, turma: 'A' }
const fundamental = { etapaEnsino: 'FUNDAMENTAL', serie: 4, turma: 'B' }
const pergunta = {
  id: 1,
  pergunta: 'Pergunta para a mediação',
  correta: 'A',
  opcoes: ['A', 'B', 'C', 'D'],
  pontosIniciais: 100,
}
beforeEach(() => {
  vi.clearAllMocks()
  registrarSessao.mockReset()
})

it('envia o mesmo contexto global a todas as escolas e guarda a categoria realmente jogada', async () => {
  saveMediation({
    escolas: [
      { nomeEscola: 'Primeira escola', turmas: [medio] },
      { nomeEscola: 'Segunda escola', turmas: [fundamental] },
    ],
  })
  carregarQuiz.mockResolvedValue({
    perguntas: [pergunta],
    categoriaQuiz: 'FUNDAMENTAL_1',
    contextoQuiz: 'contexto-misto-assinado',
  })
  registrarSessao.mockResolvedValue({
    partida: { pontuacaoFinal: 100, categoriaQuiz: 'FUNDAMENTAL_1' },
  })
  render(
    <MemoryRouter>
      <QuizPage />
    </MemoryRouter>,
  )
  expect(screen.getByRole('status').closest('.loading-state--full-screen')).toBeInTheDocument()
  await screen.findByText(pergunta.pergunta)
  expect(carregarQuiz).toHaveBeenCalledWith([medio, fundamental])
  fireEvent.click(screen.getByText('Selecionar A'))
  fireEvent.click(screen.getByText('Confirmar'))
  fireEvent.click(screen.getByText('Avançar'))
  await waitFor(() => expect(registrarSessao).toHaveBeenCalledTimes(2))
  registrarSessao.mock.calls.forEach(([payload]) => {
    expect(payload.contextoQuiz).toBe('contexto-misto-assinado')
    expect(payload.pontuacaoFinal).toBe(100)
  })
  await waitFor(() => expect(getResult()?.partida?.categoriaQuiz).toBe('FUNDAMENTAL_1'))
  expect(getResult().resultados).toHaveLength(2)
})

it('não inicia ou salva uma mediação sem o contexto confirmado pelo backend', async () => {
  saveMediation({ nomeEscola: 'Modelo', turmas: [medio] })
  carregarQuiz.mockResolvedValue({ perguntas: [pergunta], categoriaQuiz: 'MEDIO' })
  render(
    <MemoryRouter>
      <QuizPage />
    </MemoryRouter>,
  )
  expect(await screen.findByText(/Não foi possível preparar esta mediação/)).toBeInTheDocument()
  expect(screen.queryByText(pergunta.pergunta)).not.toBeInTheDocument()
  expect(registrarSessao).not.toHaveBeenCalled()
})
