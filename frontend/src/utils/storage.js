const MEDIATION_KEY =
    "vixe-tu-sabe:mediacao";

const RESULT_KEY =
    "vixe-tu-sabe:resultado";

export function saveMediation(data) {
    sessionStorage.setItem(
        MEDIATION_KEY,
        JSON.stringify(data),
    );
}

export function getMediation() {
    try {
        const value =
        sessionStorage.getItem(
            MEDIATION_KEY,
        );

        return value
        ? JSON.parse(value)
        : null;
    } catch {
        return null;
    }
}

export function saveResult(data) {
    sessionStorage.setItem(
        RESULT_KEY,
        JSON.stringify(data),
    );
}

export function getResult() {
    try {
        const value =
        sessionStorage.getItem(
            RESULT_KEY,
        );

        return value
        ? JSON.parse(value)
        : null;
    } catch {
        return null;
    }
}

export function clearQuizStorage() {
    sessionStorage.removeItem(
        MEDIATION_KEY,
    );

    sessionStorage.removeItem(
        RESULT_KEY,
    );
}