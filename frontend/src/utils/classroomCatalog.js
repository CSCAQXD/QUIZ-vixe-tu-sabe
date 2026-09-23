export const ORGANIZATION_OPTIONS = [
    { value: "REGULAR", label: "Escola regular" },
    { value: "TECNICA", label: "EEEP, IF ou escola técnica" },
];

export const COURSE_OPTIONS = [
    { value: "ADMINISTRACAO", label: "Administração" },
    { value: "AGROPECUARIA", label: "Agropecuária" },
    { value: "DESENVOLVIMENTO_SISTEMAS", label: "Desenvolvimento de Sistemas" },
    { value: "ENFERMAGEM", label: "Enfermagem" },
    { value: "INFORMATICA", label: "Informática" },
    { value: "REDES_COMPUTADORES", label: "Redes de Computadores" },
];

export const CLASS_DIVISION_OPTIONS = [
    { value: "UNICA", label: "Turma única" },
    { value: "A", label: "Turma A" },
    { value: "B", label: "Turma B" },
    { value: "C", label: "Turma C" },
    { value: "D", label: "Turma D" },
];

export function optionLabel(options, value) {
    return options.find((option) => option.value === value)?.label ?? value;
}

export function formatClassroom(classroom) {
    const grade = `${classroom.serie}º ano`;
    const division = optionLabel(CLASS_DIVISION_OPTIONS, classroom.turma);

    if (classroom.tipoOrganizacao === "TECNICA") {
        const course = optionLabel(COURSE_OPTIONS, classroom.curso);
        return `${grade} de ${course} · ${division}`;
    }

    return `${grade} · ${division}`;
}
