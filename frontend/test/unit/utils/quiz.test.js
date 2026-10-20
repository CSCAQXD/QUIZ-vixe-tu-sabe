import { describe, expect, it } from 'vitest'
import { findCorrectOptionIndex, normalizeQuestion, normalizeText } from '../../../src/utils/quiz'

describe('quiz utils', () => {
  it('normaliza textos vazios e com espaços', () => {
    expect(normalizeText('  AÇÃO ')).toBe('ação')
    expect(normalizeText(null)).toBe('')
  })

  it.each([
    ['B', 1],
    [2, 2],
    ['Resposta', 3],
    ['inexistente', -1],
  ])('encontra a alternativa correta %s', (correta, expected) => {
    expect(
      findCorrectOptionIndex({
        correta,
        opcoes: ['A', 'B', 'C', 'Resposta'],
      }),
    ).toBe(expected)
  })

  it('normaliza perguntas e remove dicas vazias', () => {
    expect(
      normalizeQuestion({
        id: 1,
        tema: '  História & Vida  ',
        pergunta: 42,
        opcoes: [1, 2],
        dicas: ['dica', ''],
        correta: 0,
        pontosIniciais: -10,
      }),
    ).toMatchObject({
      id: '1',
      tema: 'História & Vida',
      pergunta: '42',
      opcoes: ['1', '2'],
      dicas: ['dica'],
      pontosIniciais: 0,
      correctIndex: 0,
    })
  })

  it('trata coleções inválidas e pontos não numéricos', () => {
    const question = normalizeQuestion({ id: 1, pergunta: '?', correta: 'x' })
    expect(question.opcoes).toEqual([])
    expect(question.dicas).toEqual([])
    expect(question.pontosIniciais).toBe(0)
    expect(question.tema).toBe('Tema geral')
  })
})
