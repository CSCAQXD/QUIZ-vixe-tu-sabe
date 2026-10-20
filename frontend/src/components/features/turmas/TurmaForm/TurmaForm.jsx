import Button from '../../../common/Button/Button'
import FormField from '../../../common/FormField/FormField'
import SelectField from '../../../common/SelectField/SelectField'
import CidadeAutocomplete from '../CidadeAutocomplete/CidadeAutocomplete'
import CursoAutocomplete from '../CursoAutocomplete/CursoAutocomplete'
import EscolaAutocomplete from '../EscolaAutocomplete/EscolaAutocomplete'
import './TurmaForm.css'

const GRADE_OPTIONS = [
  ...Array.from({ length: 9 }, (_, index) => ({
    label: `${index + 1}º ano — Ensino Fundamental`,
    value: `FUNDAMENTAL:${index + 1}`,
  })),
  ...Array.from({ length: 3 }, (_, index) => ({
    label: `${index + 1}º ano — Ensino Médio`,
    value: `MEDIO:${index + 1}`,
  })),
]

const ORGANIZATION_OPTIONS = [
  { label: 'Escola regular', value: 'REGULAR' },
  { label: 'Ensino técnico ou profissional', value: 'TECNICA' },
]

const CLASS_TYPE_OPTIONS = [
  { label: 'Turma única', value: 'UNICA' },
  { label: 'Turma dividida', value: 'DIVIDIDA' },
]

function TurmaForm({
  canReuseSchool,
  errors = {},
  index,
  onChange,
  onFieldBlur,
  onRemove,
  onUsePreviousSchool,
  removable,
  turma,
}) {
  const headingId = `turma-${turma.id}-titulo`
  const formErrorId = `turma-${turma.id}-error`

  function update(field, value) {
    onChange({
      ...turma,
      [field]: value,
    })
  }

  function updateGrade(value) {
    const [etapaEnsino, serie] = value.split(':')

    onChange({
      ...turma,
      etapaEnsino,
      serie,
    })
  }

  const gradeValue = turma.etapaEnsino && turma.serie ? `${turma.etapaEnsino}:${turma.serie}` : ''

  return (
    <section
      aria-describedby={errors.form ? formErrorId : undefined}
      aria-labelledby={headingId}
      className={`turma-form${errors.form ? ' turma-form--invalid' : ''}`}
    >
      <div className="turma-form__header">
        <h2 id={headingId}>TURMA {index + 1}</h2>

        {removable && (
          <Button className="turma-form__remove" onClick={onRemove} variant="danger">
            × Remover
          </Button>
        )}
      </div>

      {errors.form && (
        <p className="turma-form__error" id={formErrorId} role="alert">
          {errors.form}
        </p>
      )}

      <CidadeAutocomplete
        cidade={turma.cidade}
        cidadeUf={turma.cidadeUf}
        id={`cidade-${turma.id}`}
        error={errors.cidade}
        onBlur={() => onFieldBlur('cidade')}
        onChange={(municipality) => {
          const changedMunicipality = municipality.municipioIbgeId !== turma.municipioIbgeId
          onChange({
            ...turma,
            ...municipality,
            ...(changedMunicipality ? { codigoInep: '', nomeEscola: '' } : {}),
          })
        }}
      />

      <EscolaAutocomplete
        codigoInep={turma.codigoInep}
        error={errors.nomeEscola}
        id={`escola-${turma.id}`}
        municipioIbgeId={turma.municipioIbgeId}
        nomeEscola={turma.nomeEscola}
        onBlur={() => onFieldBlur('nomeEscola')}
        onChange={(school) =>
          onChange({
            ...turma,
            ...school,
          })
        }
      />

      {index > 0 && (
        <Button
          className="turma-form__reuse-school"
          disabled={!canReuseSchool}
          onClick={onUsePreviousSchool}
          variant="secondary"
        >
          ↳ Usar escola anterior
        </Button>
      )}

      <div className="turma-form__configuration">
        <SelectField
          id={`organizacao-${turma.id}`}
          label="Tipo de organização"
          onChange={(value) =>
            onChange({
              ...turma,
              cursoNome: value === 'REGULAR' ? '' : turma.cursoNome,
              tipoOrganizacao: value,
            })
          }
          options={ORGANIZATION_OPTIONS}
          value={turma.tipoOrganizacao}
        />

        <SelectField
          id={`tipo-turma-${turma.id}`}
          label="Organização da turma"
          onChange={(value) =>
            onChange({
              ...turma,
              organizacaoTurma: value,
              turma: value === 'UNICA' ? 'UNICA' : '',
            })
          }
          options={CLASS_TYPE_OPTIONS}
          value={turma.organizacaoTurma}
        />
        {turma.tipoOrganizacao === 'TECNICA' && (
          <CursoAutocomplete
            id={`curso-${turma.id}`}
            error={errors.cursoNome}
            onBlur={() => onFieldBlur('cursoNome')}
            onChange={(value) => update('cursoNome', value)}
            value={turma.cursoNome}
          />
        )}
      </div>

      <div
        className={`turma-form__fields${
          turma.organizacaoTurma === 'UNICA' ? ' turma-form__fields--single' : ''
        }`}
      >
        <SelectField
          id={`serie-${turma.id}`}
          label="Série"
          error={errors.serie}
          onBlur={() => onFieldBlur('serie')}
          onChange={updateGrade}
          options={GRADE_OPTIONS}
          placeholder="Série"
          required
          value={gradeValue}
        />

        {turma.organizacaoTurma === 'DIVIDIDA' && (
          <FormField
            id={`turma-${turma.id}`}
            label="Identificação da turma"
            error={errors.turma}
            maxLength={30}
            onBlur={() => onFieldBlur('turma')}
            onChange={(value) => update('turma', value)}
            placeholder="Ex.: A, B ou Noite"
            required
            value={turma.turma}
          />
        )}
      </div>
    </section>
  )
}

export default TurmaForm
