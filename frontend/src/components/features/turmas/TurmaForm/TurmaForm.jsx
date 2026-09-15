import Button from "../../../common/Button/Button";
import FormField from "../../../common/FormField/FormField";
import "./TurmaForm.css";

function TurmaForm({
    index,
    onChange,
    onRemove,
    removable,
    schoolField = null,
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
        <h2 id={headingId}>
            TURMA {index + 1}
        </h2>

        {schoolField}

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

        {removable && (
            <Button
            className="turma-form__remove"
            onClick={onRemove}
            variant="danger"
            >
            REMOVER TURMA
            </Button>
        )}
        </section>
    );
}

export default TurmaForm;
