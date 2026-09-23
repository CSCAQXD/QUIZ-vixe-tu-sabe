import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button/Button";
import BackButton from "../../components/common/BackButton/BackButton";
import CadastroTurmasScene from "../../components/features/turmas/CadastroTurmasScene/CadastroTurmasScene";
import TurmaForm from "../../components/features/turmas/TurmaForm/TurmaForm";
import { groupClassroomsBySchool } from "../../utils/mediation";
import { saveMediation } from "../../utils/storage";

import "./CadastroTurmasPage.css";

function createClassroom() {
    return {
        etapaEnsino: "",
        id: crypto.randomUUID(),
        nomeEscola: "",
        serie: "",
        turma: "",
    };
}

function validateClassrooms(classrooms) {
    const errors = {};
    const identifiers = new Set();

    classrooms.forEach((classroom) => {
        const classroomErrors = {};
        const schoolName = classroom.nomeEscola
            .trim()
            .replace(/\s+/g, " ");
        const className = classroom.turma.trim();
        const grade = Number(classroom.serie);
        const maxGrade = classroom.etapaEnsino === "MEDIO" ? 3 : 9;

        if (!schoolName) {
            classroomErrors.nomeEscola = "Campo obrigatório.";
        } else if (schoolName.length < 3) {
            classroomErrors.nomeEscola = "Digite pelo menos 3 letras.";
        }

        if (!classroom.etapaEnsino || !classroom.serie) {
            classroomErrors.serie = "Campo obrigatório.";
        } else if (!Number.isInteger(grade) || grade < 1 || grade > maxGrade) {
            classroomErrors.serie = `Informe uma série entre 1 e ${maxGrade}.`;
        }

        if (!className) {
            classroomErrors.turma = "Campo obrigatório.";
        }

        if (Object.keys(classroomErrors).length === 0) {
            const identifier = [
                schoolName.toLocaleUpperCase("pt-BR"),
                classroom.etapaEnsino,
                grade,
                className.toLocaleUpperCase("pt-BR"),
            ].join(":");

            if (identifiers.has(identifier)) {
                classroomErrors.turma =
                    "Esta série e turma já foram adicionadas para esta escola.";
            }

            identifiers.add(identifier);
        }

        errors[classroom.id] = classroomErrors;
    });

    return errors;
}

function CadastroTurmasPage() {
    const navigate = useNavigate();

    const [classrooms, setClassrooms] =
        useState([createClassroom()]);

    const [error, setError] =
        useState("");

    const [submitted, setSubmitted] =
        useState(false);

    const [touched, setTouched] =
        useState({});

    const validationErrors = useMemo(
        () => validateClassrooms(classrooms),
        [classrooms],
    );

    const isValid = classrooms.length > 0 && Object.values(validationErrors)
        .every((classroomErrors) => Object.keys(classroomErrors).length === 0);

    function touchField(classroomId, field) {
        setTouched((current) => ({
            ...current,
            [`${classroomId}:${field}`]: true,
        }));
    }

    function visibleErrors(classroom) {
        return Object.fromEntries(
            Object.entries(validationErrors[classroom.id] ?? {})
                .filter(([field]) =>
                    submitted || touched[`${classroom.id}:${field}`]
                ),
        );
    }

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
        setSubmitted(true);

        if (!isValid) {
            setError("");
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
            noValidate
            onSubmit={handleSubmit}
        >
            <BackButton fallback="/" label="Voltar" />

            <div className="registration-page__content">
            <h1>REGISTRE OS DADOS DA TURMA</h1>
            <p className="registration-page__intro">
                Identifique cada grupo que participará desta mediação.
            </p>

            <div className="registration-page__forms">
            {classrooms.map(
                (classroom, index) => (
                <TurmaForm
                    errors={visibleErrors(classroom)}
                    index={index}
                    key={classroom.id}
                    onChange={(newClassroom) =>
                    updateClassroom(
                        classroom.id,
                        newClassroom,
                    )
                    }
                    onFieldBlur={(field) =>
                    touchField(classroom.id, field)
                    }
                    onRemove={() =>
                    removeClassroom(
                        classroom.id,
                    )
                    }
                    removable={
                    classrooms.length > 1
                    }
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

            <div className="registration-page__actions">
            <Button
                disabled={classrooms.length >= 20}
                onClick={addClassroom}
                variant="secondary"
            >
                + ADICIONAR TURMA
            </Button>

            <Button type="submit" variant="success">
                INICIAR QUIZ DA MEDIAÇÃO
            </Button>
            </div>

            {error && (
            <p
                aria-live="polite"
                className="registration-page__error"
            >
                {error}
            </p>
            )}
            </div>

        </form>
        </section>
    );
}

export default CadastroTurmasPage;
