import Button from "../../../common/Button/Button";
import FormField from "../../../common/FormField/FormField";
import "./TurmaForm.css";

function TurmaForm({
    canReuseSchool,
    index,
    onChange,
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
            labelVisuallyHidden
            maxLength={200}
            onChange={(value) => update("nomeEscola", value)}
            placeholder="Nome da Escola"
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

        <div className="turma-form__fields">
            <FormField
            id={`serie-${turma.id}`}
            label="Série"
            labelVisuallyHidden
            min="1"
            onChange={(value) =>
                update("serie", value)
            }
            placeholder="Série"
            required
            type="number"
            value={turma.serie}
            />

            <FormField
            id={`turma-${turma.id}`}
            label="Turma"
            labelVisuallyHidden
            maxLength={30}
            onChange={(value) =>
                update("turma", value)
            }
            placeholder="Turma"
            required
            value={turma.turma}
            />
        </div>

        </section>
    );
}

export default TurmaForm;
