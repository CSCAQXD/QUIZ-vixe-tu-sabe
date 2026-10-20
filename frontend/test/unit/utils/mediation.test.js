import { describe, expect, it } from 'vitest'
import {
  classNameIdentityKey,
  classroomIdentityKey,
  classroomsAreEquivalent,
  courseIdentityKey,
  coursesAreEquivalent,
  findTechnicalCourseMatches,
  getMediationSchools,
  getEquivalentTechnicalCourses,
  groupClassroomsBySchool,
  schoolIdentityKey,
  TECHNICAL_COURSE_COUNT,
} from '../../../src/utils/mediation'

describe('mediation utils', () => {
  it('agrupa turmas da mesma escola sem diferenciar caixa e espaços', () => {
    expect(
      groupClassroomsBySchool([
        { nomeEscola: ' Escola A ', etapaEnsino: 'FUNDAMENTAL', serie: '3', turma: ' A ' },
        { nomeEscola: 'escola   a', etapaEnsino: 'MEDIO', serie: '3', turma: 'B' },
      ]),
    ).toEqual([
      {
        nomeEscola: 'Escola A',
        cidade: 'Não informada',
        turmas: [
          {
            etapaEnsino: 'FUNDAMENTAL',
            tipoOrganizacao: 'REGULAR',
            organizacaoTurma: 'DIVIDIDA',
            serie: 3,
            turma: 'A',
          },
          {
            etapaEnsino: 'MEDIO',
            tipoOrganizacao: 'REGULAR',
            organizacaoTurma: 'DIVIDIDA',
            serie: 3,
            turma: 'B',
          },
        ],
      },
    ])
  })

  it('normaliza acentos, pontuação e siglas ao identificar a escola', () => {
    expect(schoolIdentityKey('E.E.E.P. José de Alencar')).toBe(
      schoolIdentityKey('  eeep JOSE de alencar '),
    )
    expect(schoolIdentityKey('Escola Estadual de Educação Profissional José de Alencar')).toBe(
      schoolIdentityKey('José de Alencar'),
    )
  })

  it('considera nomes equivalentes do curso de Redes de Computadores', () => {
    expect(courseIdentityKey('REDES')).toBe(
      courseIdentityKey('Curso Técnico em Redes de Computadores'),
    )
    expect(courseIdentityKey('redes computacionais')).toBe(courseIdentityKey('Rede de computador'))
    expect(courseIdentityKey('Curso Profissionalizante de Redes Computacionais')).toBe(
      courseIdentityKey('Redes'),
    )
    expect(courseIdentityKey('T.I.')).toBe(courseIdentityKey('TI'))
    expect(classNameIdentityKey('Turma Única')).toBe(classNameIdentityKey('unica'))
  })

  it('pesquisa o catálogo sem expor uma lista gigante e preserva curso novo', () => {
    expect(TECHNICAL_COURSE_COUNT).toBe(282)
    expect(findTechnicalCourseMatches('red comp')).toContainEqual(
      expect.objectContaining({ name: 'Redes de Computadores' }),
    )
    expect(findTechnicalCourseMatches('nuvem').map((course) => course.name)).toEqual(
      expect.arrayContaining(['Cloud Computing', 'Computação em Nuvem']),
    )
    expect(findTechnicalCourseMatches('xy curso inexistente')).toEqual([])
  })

  it('compartilha a identidade dos aliases sem trocar o nome escolhido', () => {
    expect(courseIdentityKey('Segurança da Informação')).toBe(courseIdentityKey('Cibersegurança'))
    expect(courseIdentityKey('IoT')).toBe(courseIdentityKey('Internet das Coisas'))
    expect(courseIdentityKey('Computação em Nuvem')).toBe(courseIdentityKey('Cloud Computing'))
    expect(courseIdentityKey('Manutenção de Sistemas Metroferroviários')).toBe(
      courseIdentityKey('Manutenção Metroferroviária'),
    )
    expect(courseIdentityKey('Artes Circenses')).toBe(courseIdentityKey('Artista de Circo'))
    expect(courseIdentityKey('Agenciamento de Viagem')).toBe(
      courseIdentityKey('Agenciamento de Viagens'),
    )
    expect(getEquivalentTechnicalCourses('MEC').map((course) => course.name)).toEqual(
      expect.arrayContaining(['Manobras e Equipamentos de Convés', 'Mecânica', 'Mecatrônica']),
    )
  })

  it('preserva para cada escola o nome de curso escolhido', () => {
    const grouped = groupClassroomsBySchool([
      {
        cidade: 'Fortaleza',
        nomeEscola: 'Escola Alfa',
        etapaEnsino: 'MEDIO',
        serie: 1,
        turma: 'UNICA',
        cursoNome: 'Cibersegurança',
      },
      {
        cidade: 'Sobral',
        nomeEscola: 'Escola Beta',
        etapaEnsino: 'MEDIO',
        serie: 1,
        turma: 'UNICA',
        cursoNome: 'Segurança da Informação',
      },
    ])

    expect(grouped.map((school) => school.turmas[0].cursoNome)).toEqual([
      'Cibersegurança',
      'Segurança da Informação',
    ])
  })

  it('aplica equivalência geral a siglas, abreviações e singular ou plural', () => {
    expect(coursesAreEquivalent('ADS', 'Análise e Desenvolvimento de Sistemas')).toBe(true)
    expect(coursesAreEquivalent('R.H.', 'Recursos Humanos')).toBe(true)
    expect(coursesAreEquivalent('ADM', 'Administração')).toBe(true)
    expect(coursesAreEquivalent('Edificações', 'Edificação')).toBe(true)
    expect(coursesAreEquivalent('Administração', 'Administração Pública')).toBe(false)
    expect(coursesAreEquivalent('Informática', 'Informática para Internet')).toBe(false)
  })

  it('compara a turma completa usando equivalência geral do curso', () => {
    const base = {
      cidade: 'Fortaleza',
      nomeEscola: 'E.E.E.P. Modelo',
      etapaEnsino: 'MEDIO',
      serie: '1',
    }

    expect(
      classroomsAreEquivalent(
        { ...base, cursoNome: 'ADS', turma: 'A-1' },
        {
          ...base,
          nomeEscola: 'Modelo',
          cursoNome: 'Análise e Desenvolvimento de Sistemas',
          turma: 'turma a 1',
        },
      ),
    ).toBe(true)
  })

  it('mantém cursos diferentes como turmas distintas', () => {
    const base = {
      cidade: 'Fortaleza',
      nomeEscola: 'Escola Técnica',
      etapaEnsino: 'MEDIO',
      serie: '1',
      turma: 'UNICA',
    }

    expect(classroomIdentityKey({ ...base, cursoNome: 'Redes' })).not.toBe(
      classroomIdentityKey({ ...base, cursoNome: 'Enfermagem' }),
    )
    expect(
      groupClassroomsBySchool([
        { ...base, cursoNome: 'Redes' },
        { ...base, cursoNome: 'Enfermagem' },
      ])[0].turmas,
    ).toHaveLength(2)
  })

  it('recusa explicitamente duplicatas equivalentes antes de salvar', () => {
    expect(() =>
      groupClassroomsBySchool([
        {
          cidade: 'Fortaleza',
          nomeEscola: 'E.E.E.P. José de Alencar',
          etapaEnsino: 'MEDIO',
          tipoOrganizacao: 'TECNICA',
          organizacaoTurma: 'UNICA',
          cursoNome: 'REDES',
          serie: '1',
          turma: 'Única',
        },
        {
          cidade: 'fortaleza',
          nomeEscola: 'eeep jose de alencar',
          etapaEnsino: 'MEDIO',
          tipoOrganizacao: 'TECNICA',
          organizacaoTurma: 'UNICA',
          cursoNome: 'Curso técnico em Redes de Computadores',
          serie: 1,
          turma: 'turma unica',
        },
      ]),
    ).toThrow(/há turmas equivalentes/)
  })

  it('mantém escolas homônimas de cidades diferentes separadas', () => {
    const classroom = {
      nomeEscola: 'Escola Modelo',
      etapaEnsino: 'MEDIO',
      serie: '1',
      turma: 'UNICA',
    }

    expect(
      groupClassroomsBySchool([
        { ...classroom, cidade: 'Fortaleza' },
        { ...classroom, cidade: 'Sobral' },
      ]),
    ).toHaveLength(2)
  })

  it('usa o código INEP para distinguir e reunir escolas oficiais', () => {
    const classroom = {
      cidade: 'Quixadá',
      municipioIbgeId: '2311306',
      nomeEscola: 'Escola Modelo',
      etapaEnsino: 'MEDIO',
      serie: '1',
      turma: 'UNICA',
    }

    expect(
      groupClassroomsBySchool([
        { ...classroom, codigoInep: '23000001' },
        { ...classroom, codigoInep: '23000002' },
      ]),
    ).toHaveLength(2)

    expect(
      groupClassroomsBySchool([
        { ...classroom, codigoInep: '23000001', turma: 'A' },
        {
          ...classroom,
          codigoInep: '23000001',
          nomeEscola: 'E. Modelo',
          turma: 'B',
        },
      ]),
    ).toHaveLength(1)
  })

  it('lê o formato atual, o legado e ausência de mediação', () => {
    const escolas = [{ nomeEscola: 'A', turmas: [] }]
    expect(getMediationSchools({ escolas })).toBe(escolas)
    expect(getMediationSchools({ nomeEscola: 'A', cidade: 'B', turmas: [] })).toEqual(
      escolas.map((item) => ({ ...item, cidade: 'B' })),
    )
    expect(getMediationSchools(null)).toEqual([])
    expect(getMediationSchools({ escolas: [] })).toHaveLength(1)
  })
})
