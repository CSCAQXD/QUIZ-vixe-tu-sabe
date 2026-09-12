const OPTION_LABELS = [
    "A",
    "B",
    "C",
    "D",
];

export function normalizeText(value) {
    return String(value ?? "")
        .trim()
        .toLocaleLowerCase("pt-BR");
}

export function findCorrectOptionIndex(
    question,
    ) {
    const correct =
        normalizeText(question.correta);

    const labelIndex =
        OPTION_LABELS.findIndex(
        (label) =>
            normalizeText(label) === correct,
        );

    if (labelIndex !== -1) {
        return labelIndex;
    }

    const numericValue =
        Number(question.correta);

    if (
        Number.isInteger(numericValue) &&
        numericValue >= 0 &&
        numericValue <
        question.opcoes.length
    ) {
        return numericValue;
    }

    return question.opcoes.findIndex(
        (option) =>
        normalizeText(option) === correct,
    );
}

export function normalizeQuestion(question) {
    const normalized = {
        ...question,
        id: String(question.id),
        pergunta: String(question.pergunta),
        opcoes: Array.isArray(question.opcoes)
        ? question.opcoes.map(String)
        : [],
        dicas: Array.isArray(question.dicas)
        ? question.dicas.filter(Boolean).map(String)
        : [],
        pontosIniciais: Math.max(
        0,
        Number(question.pontosIniciais) || 0,
        ),
    };

    return {
        ...normalized,
        correctIndex:
        findCorrectOptionIndex(normalized),
    };
}

export function calculateAvailablePoints(
    initialPoints,
    hintsUsed,
) {
    const discountPerHint = Math.ceil(
        initialPoints * 0.25,
    );

    return Math.max(
        0,
        initialPoints -
        discountPerHint * hintsUsed,
    );
}

export function isCorrectAnswer(
    question,
    selectedIndex,
) {
    return (
        question.correctIndex !== -1 &&
        question.correctIndex ===
        selectedIndex
    );
}