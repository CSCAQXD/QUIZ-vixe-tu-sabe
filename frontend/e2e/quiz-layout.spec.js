import { expect, test } from '@playwright/test'

const longQuestion =
  'Nascido no Crato, Cego Aderaldo ainda era criança quando sua família deixou o Cariri durante a grande seca de 1877–1879 e se estabeleceu em Quixadá. Foi no Sertão Central que ele cresceu, trabalhou e iniciou a trajetória artística que o tornou uma referência da cultura popular. Considerando esse percurso e as transformações sociais descritas no texto, qual interpretação relaciona melhor sua história às experiências vividas pela população cearense?'

const longOptions = [
  'Busca familiar por formação artística nos grandes centros urbanos.',
  'Separação cultural entre o Cariri e o Sertão Central.',
  'Influência das secas sobre as migrações e as histórias pessoais.',
  'Ruptura definitiva do cantador com suas origens cearenses.',
]

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
  { width: 720, height: 900 },
]) {
  test(`acomoda conteúdo extenso em ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.addInitScript(() => {
      sessionStorage.setItem(
        'vixe-tu-sabe:mediacao',
        JSON.stringify({
          nomeEscola: 'EEEP Júlio França',
          idempotencyKey: 'layout-extenso',
          turmas: [{ etapaEnsino: 'MEDIO', serie: 3, turma: 'A' }],
        }),
      )
    })
    await page.route('**/api/perguntas**', (route) =>
      route.fulfill({
        json: {
          categoriaQuiz: 'MEDIO',
          contextoQuiz: 'contexto-layout-extenso',
          perguntas: [
            {
              id: 'CA-ORI-EM-01',
              tema: 'Origens e caminhos',
              pergunta: longQuestion,
              opcoes: longOptions,
              correta: 'C',
              dicas: [],
              pontosIniciais: 100,
            },
          ],
        },
      }),
    )

    await page.goto('/quiz')

    const board = page.locator('.quiz-board')
    const question = page.locator('.quiz-board__question')
    const options = page.locator('.quiz-board__options')
    await expect(page.getByRole('heading', { name: longQuestion })).toBeVisible()
    await expect(board).toHaveClass(/quiz-board--compact/)

    const questionBox = await question.boundingBox()
    const optionsBox = await options.boundingBox()
    expect(questionBox).not.toBeNull()
    expect(optionsBox).not.toBeNull()
    expect(questionBox.y + questionBox.height).toBeLessThanOrEqual(optionsBox.y)

    const overflowingElements = await page
      .locator('.quiz-board__question, .answer-option')
      .evaluateAll(
        (elements) =>
          elements.filter(
            (element) =>
              element.scrollHeight > element.clientHeight + 1 ||
              element.scrollWidth > element.clientWidth + 1,
          ).length,
      )
    expect(overflowingElements).toBe(0)
  })
}
