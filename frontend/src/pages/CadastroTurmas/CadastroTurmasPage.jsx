import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button/Button";
import BackButton from "../../components/common/BackButton/BackButton";
import FormField from "../../components/common/FormField/FormField";
import CadastroTurmasScene from "../../components/features/turmas/CadastroTurmasScene/CadastroTurmasScene";
import TurmaForm from "../../components/features/turmas/TurmaForm/TurmaForm";
import { saveMediation } from "../../utils/storage";

import "./CadastroTurmasPage.css";

function createClassroom() {
    return {
        id: crypto.randomUUID(),
        serie: "",
        turma: "",
    };
}

function CadastroTurmasPage() {
    const navigate = useNavigate();

    const [schoolName, setSchoolName] =
        useState("");

    const [classrooms, setClassrooms] =
        useState([createClassroom()]);

    const [error, setError] =
        useState("");

    const isValid = useMemo(() => {
        if (
        !schoolName.trim() ||
        classrooms.length === 0
        ) {
        return false;
        }

        const identifiers = new Set();

        return classrooms.every(
        (classroom) => {
            const grade =
            Number(classroom.serie);

            const className =
            classroom.turma.trim();

            if (
            !Number.isInteger(grade) ||
            grade < 1 ||
            grade > 12 ||
            !className ||
            className.length > 30
            ) {
            return false;
            }

            const identifier =
            `${grade}:${className.toLocaleUpperCase(
                "pt-BR",
            )}`;

            if (
            identifiers.has(identifier)
            ) {
            return false;
            }

            identifiers.add(identifier);
            return true;
        },
        );
    }, [
        classrooms,
        schoolName,
    ]);

    function updateClassroom(
        classroomId,
        newClassroom,
    ) {
        setClassrooms((current) =>
        current.map((classroom) =>
            classroom.id === classroomId
            ? newClassroom
            : classroom,
        ),
        );

        setError("");
    }

    function removeClassroom(
        classroomId,
    ) {
        setClassrooms((current) =>
        current.filter(
            (classroom) =>
            classroom.id !== classroomId,
        ),
        );

        setError("");
    }

    function addClassroom() {
        if (classrooms.length >= 20) {
        setError(
            "Uma partida pode possuir no máximo 20 turmas.",
        );
        return;
        }

        setClassrooms((current) => [
        ...current,
        createClassroom(),
        ]);

        setError("");
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!isValid) {
        setError(
            "Preencha os dados corretamente e não repita a mesma série e turma.",
        );
        return;
        }

        saveMediation({
        nomeEscola: schoolName.trim(),
        cidade: "Não informada",
        turmas: classrooms.map(
            (classroom) => ({
            serie: Number(
                classroom.serie,
            ),
            turma:
                classroom.turma.trim(),
            }),
        ),
        });

        navigate("/quiz");
    }

    return (
        <section className="registration-page">
        <CadastroTurmasScene />

        <form
            className="registration-page__panel"
            onSubmit={handleSubmit}
        >
            <BackButton fallback="/" label="Voltar" />

            <h1>REGISTRE OS DADOS DA TURMA</h1>

            <div className="registration-page__forms">
            {classrooms.map(
                (classroom, index) => (
                <TurmaForm
                    index={index}
                    key={classroom.id}
                    onChange={(newClassroom) =>
                    updateClassroom(
                        classroom.id,
                        newClassroom,
                    )
                    }
                    onRemove={() =>
                    removeClassroom(
                        classroom.id,
                    )
                    }
                    removable={
                    classrooms.length > 1
                    }
                    schoolField={index === 0 ? (
                    <FormField
                        id="nome-escola"
                        label="Nome da escola"
                        labelVisuallyHidden
                        maxLength={200}
                        onChange={(value) => {
                        setSchoolName(value);
                        setError("");
                        }}
                        placeholder="Nome da Escola"
                        required
                        value={schoolName}
                    />
                    ) : null}
                    turma={classroom}
                />
                ),
            )}
            </div>

            {error && (
            <p
                aria-live="polite"
                className="registration-page__error"
            >
                {error}
            </p>
            )}

            <div className="registration-page__actions">
            <Button
                disabled={
                classrooms.length >= 20
                }
                onClick={addClassroom}
                variant="secondary"
            >
                + ADICIONAR TURMA
            </Button>

            <Button
                type="submit"
                variant="success"
            >
                INICIAR QUIZ DA MEDIAÇÃO
            </Button>
            </div>
        </form>
        </section>
    );
}

export default CadastroTurmasPage;
