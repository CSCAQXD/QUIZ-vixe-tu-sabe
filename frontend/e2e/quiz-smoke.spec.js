import { expect, test } from '@playwright/test'

const turma = {
  id: 'turma-1',
  etapaEnsino: 'FUNDAMENTAL',
  serie: 3,
  turma: 'A',
  posicaoRankingInterno: 1,
  totalTurmasNoRankingInterno: 1,
}

test('cadastra turma, conclui o quiz e abre o ranking', async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())
    const json = (body) => route.fulfill({ json: body, status: 200 })

    if (url.pathname === '/api/perguntas') {
      return json({
        categoriaQuiz: 'FUNDAMENTAL_1',
        contextoQuiz: 'contexto-assinado-do-smoke-test',
        perguntas: [
          {
            id: 'smoke-1',
            tema: 'Cultura cearense',
            pergunta: 'Qual é a capital do Ceará?',
            opcoes: ['Fortaleza', 'Sobral', 'Crato', 'Juazeiro do Norte'],
            correta: 'A',
            dicas: [],
            pontosIniciais: 100,
          },
        ],
      })
    }

    if (url.pathname === '/api/sessao' && route.request().method() === 'POST') {
      return json({
        partida: { ano: 2026, categoriaQuiz: 'FUNDAMENTAL_1', pontuacaoFinal: 100 },
        escola: { id: 'escola-1', nome: 'Escola Modelo' },
        turmas: [turma],
      })
    }

    if (url.pathname === '/api/ranking-turmas') {
      return json({
        total: 1,
        ranking: [
          {
            ...turma,
            escolaId: 'escola-1',
            escola: 'Escola Modelo',
            pontuacaoTotal: 100,
            posicao: 1,
          },
        ],
      })
    }

    if (url.pathname === '/api/ranking-escolas') {
      return json({
        total: 1,
        ranking: [{ id: 'escola-1', escola: 'Escola Modelo', pontuacaoTotal: 100, posicao: 1 }],
      })
    }

    if (url.pathname === '/api/escolas' || url.pathname === '/api/escolas/catalogo') {
      return json({ escolas: [] })
    }

    return json({ ranking: [] })
  })

  await page.goto('/')
  await page.getByRole('button', { name: 'INICIAR' }).click()
  await page.getByLabel('Cidade').fill('Fortaleza')
  await page.getByRole('option', { name: 'Fortaleza — CE' }).click()
  await page.getByLabel('Nome da escola').fill('Escola Modelo')
  await page.getByLabel('Série').click()
  await page.getByRole('option', { name: '3º ano — Ensino Fundamental' }).click()
  await page.getByLabel('Organização da turma').click()
  await page.getByRole('option', { name: 'Turma dividida' }).click()
  await page.getByLabel('Identificação da turma').fill('A')
  await page.getByRole('button', { name: 'INICIAR QUIZ DA MEDIAÇÃO' }).click()

  await expect(page.getByRole('heading', { name: 'Qual é a capital do Ceará?' })).toBeVisible()
  await page.getByRole('button', { name: /Fortaleza/ }).click()
  await page.getByRole('button', { name: 'Confirmar resposta' }).click()
  await expect(page.getByText('RESPOSTA CORRETA')).toBeVisible()
  await page.getByRole('button', { name: 'Próxima pergunta' }).click()

  await expect(page.getByRole('heading', { name: 'Parabéns!' })).toBeVisible()
  await expect(page.getByText('100')).toBeVisible()
  await page.getByRole('button', { name: 'Ver todos os rankings' }).click()
  await expect(page.getByRole('heading', { name: 'Rankings' })).toBeVisible()
  await expect(page.getByText('Escola Modelo').first()).toBeVisible()
})
