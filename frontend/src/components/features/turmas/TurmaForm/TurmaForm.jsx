import Button from "../../../common/Button/Button";
import FormField from "../../../common/FormField/FormField";
import "./TurmaForm.css";

function TurmaForm({
    index,
    onChange,
    onRemove,
    removable,
    turma,
}) {
    function update(field, value) {
        onChange({
        ...turma,
        [field]: value,
        });
    }

    return (
        <fieldset className="turma-form">
        <legend>TURMA {index + 1}</legend>

        <div className="turma-form__fields">
            <FormField
            id={`serie-${turma.id}`}
            label="Série"
            maxLength={2}
            min="1"
            onChange={(value) =>
                update("serie", value)
            }
            placeholder="Ex.: 9"
            required
            type="number"
            value={turma.serie}
            />

            <FormField
            id={`turma-${turma.id}`}
            label="Turma"
            maxLength={30}
            onChange={(value) =>
                update("turma", value)
            }
            placeholder="Ex.: A"
            required
            value={turma.turma}
            />
        </div>

        {removable && (
            <Button
            onClick={onRemove}
            variant="danger"
            >
            Remover turma
            </Button>
        )}
        </fieldset>
    );
}

export default TurmaForm;