import Button from "../../../common/Button/Button";
import FormField from "../../../common/FormField/FormField";
import SelectField from "../../../common/SelectField/SelectField";
import "./TurmaForm.css";

const GRADE_OPTIONS = [
    ...Array.from({ length: 9 }, (_, index) => ({
        label: `${index + 1}º ano — Ensino Fundamental`,
        value: `FUNDAMENTAL:${index + 1}`,
    })),
    ...Array.from({ length: 3 }, (_, index) => ({
        label: `${index + 1}º ano — Ensino Médio`,
        value: `MEDIO:${index + 1}`,
    })),
];

const ORGANIZATION_OPTIONS = [
    { label: "Escola regular", value: "REGULAR" },
    { label: "Ensino técnico ou profissional", value: "TECNICA" },
];

const CLASS_TYPE_OPTIONS = [
    { label: "Turma única", value: "UNICA" },
    { label: "Turma dividida", value: "DIVIDIDA" },
];

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
    const headingId = `turma-${turma.id}-titulo`;

    function update(field, value) {
        onChange({
        ...turma,
        [field]: value,
        });
    }

    function updateGrade(value) {
        const [etapaEnsino, serie] = value.split(":");

        onChange({
        ...turma,
        etapaEnsino,
        serie,
        });
    }

    const gradeValue = turma.etapaEnsino && turma.serie
        ? `${turma.etapaEnsino}:${turma.serie}`
        : "";

    return (
        <section aria-labelledby={headingId} className="turma-form">
        <div className="turma-form__header">
            <h2 id={headingId}>
                TURMA {index + 1}
            </h2>

            {removable && (
                <Button
                className="turma-form__remove"
                onClick={onRemove}
                variant="danger"
                >
                × Remover
                </Button>
            )}
        </div>

        <FormField
            id={`escola-${turma.id}`}
            label="Nome da escola"
            error={errors.nomeEscola}
            maxLength={200}
            minLength={3}
            onBlur={() => onFieldBlur("nomeEscola")}
            onChange={(value) => update("nomeEscola", value)}
            placeholder="Ex.: EEEP Maria Cavalcante Costa"
            required
            value={turma.nomeEscola}
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

        <SelectField
            id={`organizacao-${turma.id}`}
            label="Tipo de organização"
            onChange={(value) => onChange({
                ...turma,
                cursoNome: value === "REGULAR" ? "" : turma.cursoNome,
                tipoOrganizacao: value,
            })}
            options={ORGANIZATION_OPTIONS}
            value={turma.tipoOrganizacao}
        />

        {turma.tipoOrganizacao === "TECNICA" && (
            <FormField
                id={`curso-${turma.id}`}
                label="Curso"
                maxLength={120}
                onChange={(value) => update("cursoNome", value)}
                placeholder="Busque ou cadastre o curso"
                required
                value={turma.cursoNome}
            />
        )}

        <SelectField
            id={`tipo-turma-${turma.id}`}
            label="Organização da turma"
            onChange={(value) => onChange({
                ...turma,
                organizacaoTurma: value,
                turma: value === "UNICA" ? "UNICA" : "",
            })}
            options={CLASS_TYPE_OPTIONS}
            value={turma.organizacaoTurma}
        />

        <div className="turma-form__fields">
            <SelectField
            id={`serie-${turma.id}`}
            label="Série"
            error={errors.serie}
            onBlur={() => onFieldBlur("serie")}
            onChange={updateGrade}
            options={GRADE_OPTIONS}
            placeholder="Série"
            required
            value={gradeValue}
            />

            {turma.organizacaoTurma === "DIVIDIDA" && <FormField
            id={`turma-${turma.id}`}
            label="Identificação da turma"
            error={errors.turma}
            maxLength={30}
            onBlur={() => onFieldBlur("turma")}
            onChange={(value) =>
                update("turma", value)
            }
            placeholder="Ex.: A ou Única"
            required
            value={turma.turma}
            />}
        </div>

        </section>
    );
}

export default TurmaForm;
