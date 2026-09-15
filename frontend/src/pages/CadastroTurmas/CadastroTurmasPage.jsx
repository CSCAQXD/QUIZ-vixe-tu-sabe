import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../components/common/BackButton/BackButton";
import CadastroTurmasScene from "../../components/features/turmas/CadastroTurmasScene/CadastroTurmasScene";
import TurmaForm from "../../components/features/turmas/TurmaForm/TurmaForm";
import { groupClassroomsBySchool } from "../../utils/mediation";
import { saveMediation } from "../../utils/storage";

import "./CadastroTurmasPage.css";

function createClassroom() {
    return {
        id: crypto.randomUUID(),
        nomeEscola: "",
        serie: "",
        turma: "",
    };
}

function CadastroTurmasPage() {
    const navigate = useNavigate();

    const [classrooms, setClassrooms] =
        useState([createClassroom()]);

    const [error, setError] =
        useState("");

    const isValid = useMemo(() => {
        if (
        classrooms.length === 0
        ) {
        return false;
        }

        const identifiers = new Set();

        return classrooms.every(
        (classroom) => {
            const grade =
            Number(classroom.serie);

            const schoolName =
            classroom.nomeEscola
                .trim()
                .replace(/\s+/g, " ");

            const className =
            classroom.turma.trim();

            if (
            !schoolName ||
            schoolName.length > 200 ||
            !Number.isInteger(grade) ||
            grade < 1 ||
            grade > 12 ||
            !className ||
            className.length > 30
            ) {
            return false;
            }

            const identifier =
            `${schoolName.toLocaleUpperCase("pt-BR")}:${grade}:${className.toLocaleUpperCase(
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

    function copyPreviousSchool(index) {
        if (index < 1) {
        return;
        }

        const previousSchool =
        classrooms[index - 1].nomeEscola;

        setClassrooms((current) =>
        current.map((classroom, classroomIndex) =>
            classroomIndex === index
            ? {
                ...classroom,
                nomeEscola: previousSchool,
                }
            : classroom,
        ),
        );

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

        const escolas =
        groupClassroomsBySchool(classrooms);

        saveMediation({
        escolas,
        nomeEscola: escolas
            .map((school) => school.nomeEscola)
            .join(" / "),
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
                    onAdd={addClassroom}
                    onRemove={() =>
                    removeClassroom(
                        classroom.id,
                    )
                    }
                    removable={
                    classrooms.length > 1
                    }
                    canAdd={classrooms.length < 20}
                    canReuseSchool={Boolean(
                    index > 0 && classrooms[index - 1].nomeEscola.trim()
                    )}
                    onUsePreviousSchool={() =>
                    copyPreviousSchool(index)
                    }
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

        </form>
        </section>
    );
}

export default CadastroTurmasPage;
