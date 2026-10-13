export function classRankingKey(schoolId, schoolClass) {
    return [
        schoolId,
        schoolClass.etapaEnsino,
        Number(schoolClass.serie),
        schoolClass.cursoId ?? "SEM_CURSO",
        String(schoolClass.turma ?? "").trim().toLocaleUpperCase("pt-BR"),
    ].join("|||");
}

export function formatResultClass(schoolClass) {
    const level = schoolClass.etapaEnsino === "MEDIO"
        ? "Ensino Médio" : "Ensino Fundamental";
    const division = schoolClass.turma === "UNICA"
        ? "Turma única" : `Turma ${schoolClass.turma}`;
    const course = schoolClass.cursoNome ? ` · ${schoolClass.cursoNome}` : "";
    return `${schoolClass.serie}º ano · ${level}${course} · ${division}`;
}

export function buildResultGroups(results, rankingData) {
    const schools = new Map(rankingData.schools.map((item) => [item.escolaId, item]));
    const classes = new Map(rankingData.classes.map((item) => [
        classRankingKey(item.escolaId, item), item,
    ]));

    return results.map((result) => ({
        name: result.escola?.nome ?? "Escola participante",
        position: schools.get(result.escola?.id)?.posicao,
        classes: (result.turmas ?? []).map((schoolClass) => ({
            name: formatResultClass(schoolClass),
            position: classes.get(classRankingKey(result.escola?.id, schoolClass))?.posicao,
            internalPosition: schoolClass.posicaoRankingInterno,
            internalTotal: schoolClass.totalTurmasNoRankingInterno,
        })),
    }));
}
