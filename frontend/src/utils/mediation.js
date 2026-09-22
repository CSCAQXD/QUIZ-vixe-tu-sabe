function schoolKey(name) {
  return name.trim().replace(/\s+/g, " ").toLocaleUpperCase("pt-BR");
}

export function groupClassroomsBySchool(classrooms) {
  const schools = new Map();

  classrooms.forEach((classroom) => {
    const name = classroom.nomeEscola.trim().replace(/\s+/g, " ");
    const key = schoolKey(name);

    if (!schools.has(key)) {
      schools.set(key, {
        nomeEscola: name,
        cidade: "Não informada",
        turmas: [],
      });
    }

    schools.get(key).turmas.push({
      etapaEnsino: classroom.etapaEnsino,
      serie: Number(classroom.serie),
      turma: classroom.turma.trim(),
    });
  });

  return Array.from(schools.values());
}

export function getMediationSchools(mediation) {
  if (Array.isArray(mediation?.escolas) && mediation.escolas.length > 0) {
    return mediation.escolas;
  }

  return mediation
    ? [{
        nomeEscola: mediation.nomeEscola,
        cidade: mediation.cidade,
        turmas: mediation.turmas,
      }]
    : [];
}
