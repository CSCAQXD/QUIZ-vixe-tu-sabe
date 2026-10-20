import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button/Button'
import BackButton from '../../components/common/BackButton/BackButton'
import CadastroTurmasScene from '../../components/features/turmas/CadastroTurmasScene/CadastroTurmasScene'
import TurmaForm from '../../components/features/turmas/TurmaForm/TurmaForm'
import {
  classNameIdentityKey,
  classroomsAreEquivalent,
  getEquivalentTechnicalCourses,
  groupClassroomsBySchool,
  normalizeDisplayText,
} from '../../utils/mediation'
import { isMunicipalitySelectionValid } from '../../utils/municipios'
import { saveMediation } from '../../utils/storage'

import './CadastroTurmasPage.css'

function createClassroom() {
  return {
    cidade: '',
    cidadeUf: '',
    codigoInep: '',
    etapaEnsino: '',
    cursoNome: '',
    id: crypto.randomUUID(),
    nomeEscola: '',
    municipioIbgeId: '',
    organizacaoTurma: 'UNICA',
    serie: '',
    tipoOrganizacao: 'REGULAR',
    turma: 'UNICA',
  }
}

function validateClassrooms(classrooms) {
  const errors = {}
  const validClassrooms = []

  classrooms.forEach((classroom, index) => {
    const classroomErrors = {}
    const schoolName = normalizeDisplayText(classroom.nomeEscola)
    const city = normalizeDisplayText(classroom.cidade)
    const className = normalizeDisplayText(classroom.turma)
    const courseName = normalizeDisplayText(classroom.cursoNome)
    const grade = Number(classroom.serie)
    const maxGrade = classroom.etapaEnsino === 'MEDIO' ? 3 : 9

    if (!schoolName) {
      classroomErrors.nomeEscola = 'Campo obrigatório.'
    } else if (schoolName.length < 3) {
      classroomErrors.nomeEscola = 'Digite pelo menos 3 letras.'
    }

    if (!city) {
      classroomErrors.cidade = 'Campo obrigatório.'
    } else if (!isMunicipalitySelectionValid(classroom)) {
      classroomErrors.cidade = 'Selecione uma cidade da lista.'
    }

    if (!classroom.etapaEnsino || !classroom.serie) {
      classroomErrors.serie = 'Campo obrigatório.'
    } else if (!Number.isInteger(grade) || grade < 1 || grade > maxGrade) {
      classroomErrors.serie = `Informe uma série entre 1 e ${maxGrade}.`
    }

    if (!className) {
      classroomErrors.turma = 'Campo obrigatório.'
    } else if (
      classroom.organizacaoTurma === 'DIVIDIDA' &&
      classNameIdentityKey(className) === 'UNICA'
    ) {
      classroomErrors.turma =
        'Use uma identificação da divisão, como A, B ou Noite. Para uma turma única, altere a organização.'
    }

    if (classroom.tipoOrganizacao === 'TECNICA') {
      const catalogCourses = courseName ? getEquivalentTechnicalCourses(courseName) : []

      if (!courseName) {
        classroomErrors.cursoNome = 'Informe o curso.'
      } else if (catalogCourses.length > 1) {
        classroomErrors.cursoNome =
          'Esse nome pode representar mais de um curso. Escolha uma sugestão ou escreva o nome completo.'
      } else if (courseName.length < 3 && catalogCourses.length !== 1) {
        classroomErrors.cursoNome =
          'Digite pelo menos 3 caracteres ou escolha uma sigla reconhecida.'
      }
    }

    if (Object.keys(classroomErrors).length === 0) {
      const comparableClassroom = {
        ...classroom,
        cidade: city,
        cursoNome: classroom.tipoOrganizacao === 'TECNICA' ? courseName : '',
        nomeEscola: schoolName,
        serie: grade,
        turma: className,
      }
      const previous = validClassrooms.find(({ classroom: candidate }) =>
        classroomsAreEquivalent(candidate, comparableClassroom),
      )

      if (previous) {
        const comparedFields =
          classroom.tipoOrganizacao === 'TECNICA'
            ? 'escola/cidade, curso, série e identificação'
            : 'escola/cidade, série e identificação'

        classroomErrors.form =
          `Duplicada da turma ${previous.index + 1}: ${comparedFields} são equivalentes. ` +
          'Altere os dados ou remova esta turma.'
      } else {
        validClassrooms.push({ classroom: comparableClassroom, index })
      }
    }

    errors[classroom.id] = classroomErrors
  })

  return errors
}

function CadastroTurmasPage() {
  const navigate = useNavigate()

  const [classrooms, setClassrooms] = useState([createClassroom()])

  const [error, setError] = useState('')

  const [submitted, setSubmitted] = useState(false)

  const [touched, setTouched] = useState({})

  const validationErrors = useMemo(() => validateClassrooms(classrooms), [classrooms])

  const isValid =
    classrooms.length > 0 &&
    Object.values(validationErrors).every(
      (classroomErrors) => Object.keys(classroomErrors).length === 0,
    )

  const duplicateCount = Object.values(validationErrors).filter(
    (classroomErrors) => classroomErrors.form,
  ).length

  function touchField(classroomId, field) {
    setTouched((current) => ({
      ...current,
      [`${classroomId}:${field}`]: true,
    }))
  }

  function visibleErrors(classroom) {
    return Object.fromEntries(
      Object.entries(validationErrors[classroom.id] ?? {}).filter(
        ([field]) => field === 'form' || submitted || touched[`${classroom.id}:${field}`],
      ),
    )
  }

  function updateClassroom(classroomId, newClassroom) {
    setClassrooms((current) =>
      current.map((classroom) => (classroom.id === classroomId ? newClassroom : classroom)),
    )

    setError('')
  }

  function removeClassroom(classroomId) {
    setClassrooms((current) => current.filter((classroom) => classroom.id !== classroomId))

    setError('')
  }

  function addClassroom() {
    if (classrooms.length >= 20) {
      setError('Uma partida pode possuir no máximo 20 turmas.')
      return
    }

    const newClassroom = createClassroom()
    setClassrooms((current) => [...current, newClassroom])

    requestAnimationFrame(() => {
      document.getElementById(`cidade-${newClassroom.id}`)?.focus()
    })

    setError('')
  }

  function copyPreviousSchool(index) {
    if (index < 1) {
      return
    }

    const previousClassroom = classrooms[index - 1]
    const previousSchool = normalizeDisplayText(previousClassroom.nomeEscola)
    const previousCity = normalizeDisplayText(previousClassroom.cidade)

    setClassrooms((current) =>
      current.map((classroom, classroomIndex) =>
        classroomIndex === index
          ? {
              ...classroom,
              cidade: previousCity,
              cidadeUf: previousClassroom.cidadeUf,
              codigoInep: previousClassroom.codigoInep,
              municipioIbgeId: previousClassroom.municipioIbgeId,
              nomeEscola: previousSchool,
            }
          : classroom,
      ),
    )

    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)

    if (!isValid) {
      setError(
        duplicateCount > 0
          ? 'Não foi possível iniciar: há turmas repetidas. Corrija ou remova os cartões destacados.'
          : 'Revise os campos destacados antes de iniciar o quiz.',
      )
      const invalidClassroom = classrooms.find(
        (classroom) => Object.keys(validationErrors[classroom.id]).length > 0,
      )
      const classroomErrors = validationErrors[invalidClassroom.id]
      const field =
        ['cidade', 'nomeEscola', 'cursoNome', 'serie', 'turma'].find(
          (errorField) => classroomErrors[errorField],
        ) ??
        (invalidClassroom.tipoOrganizacao === 'TECNICA'
          ? 'cursoNome'
          : invalidClassroom.organizacaoTurma === 'DIVIDIDA'
            ? 'turma'
            : 'serie')
      const prefix = { nomeEscola: 'escola', cursoNome: 'curso' }[field] ?? field
      document.getElementById(`${prefix}-${invalidClassroom.id}`)?.focus()
      return
    }

    let escolas

    try {
      escolas = groupClassroomsBySchool(classrooms)
    } catch (groupingError) {
      setError(
        groupingError instanceof Error
          ? groupingError.message
          : 'Não foi possível validar as turmas cadastradas.',
      )
      return
    }

    saveMediation({
      escolas,
      nomeEscola: escolas.map((school) => school.nomeEscola).join(' / '),
    })

    navigate('/quiz')
  }

  return (
    <section className="registration-page">
      <CadastroTurmasScene />

      <form className="registration-page__panel" noValidate onSubmit={handleSubmit}>
        <div className="registration-page__content">
          <header className="registration-page__header">
            <BackButton fallback="/" label="Voltar" />
            <div>
              <span className="registration-page__eyebrow">Configuração da mediação</span>
              <h1>Cadastre as turmas</h1>
              <p className="registration-page__intro">
                Informe a escola e os grupos que vão participar do quiz.
              </p>
            </div>
          </header>

          <div className="registration-page__forms">
            {classrooms.map((classroom, index) => (
              <TurmaForm
                errors={visibleErrors(classroom)}
                index={index}
                key={classroom.id}
                onChange={(newClassroom) => updateClassroom(classroom.id, newClassroom)}
                onFieldBlur={(field) => touchField(classroom.id, field)}
                onRemove={() => removeClassroom(classroom.id)}
                removable={classrooms.length > 1}
                canReuseSchool={Boolean(
                  index > 0 &&
                    classrooms[index - 1].nomeEscola.trim() &&
                    classrooms[index - 1].cidade.trim(),
                )}
                onUsePreviousSchool={() => copyPreviousSchool(index)}
                turma={classroom}
              />
            ))}
          </div>

          <div className="registration-page__actions">
            <p aria-live="polite" className="registration-page__summary">
              {classrooms.length}{' '}
              {classrooms.length === 1 ? 'turma adicionada' : 'turmas adicionadas'}
              {classrooms.length === 20 && ' · Limite de 20 turmas atingido'}
              {duplicateCount > 0 &&
                ` · ${duplicateCount} ${duplicateCount === 1 ? 'duplicata' : 'duplicatas'}`}
            </p>
            <div className="registration-page__buttons">
              <Button disabled={classrooms.length >= 20} onClick={addClassroom} variant="secondary">
                + ADICIONAR TURMA
              </Button>

              <Button type="submit" variant="success">
                INICIAR QUIZ DA MEDIAÇÃO
              </Button>
            </div>
          </div>

          {error && (
            <p aria-live="assertive" className="registration-page__error" role="alert">
              {error}
            </p>
          )}
        </div>
      </form>
    </section>
  )
}

export default CadastroTurmasPage
