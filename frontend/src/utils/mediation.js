import technicalCourses from "../../../shared/cursosTecnicos.json";

const REGULAR_COURSE_KEY = "SEM_CURSO";

const COURSE_ALIASES = new Map([
  ["REDE", "REDE COMPUTADOR"],
  ["REDE COMPUTADOR", "REDE COMPUTADOR"],
  ["REDE COMPUTACIONAL", "REDE COMPUTADOR"],
]);

const TECHNICAL_COURSE_CATALOG = technicalCourses.map((item) =>
  typeof item === "string"
    ? { name: item, aliases: [] }
    : {
        name: item.nome,
        aliases: Array.isArray(item.aliases) ? item.aliases : [],
      },
);

const catalogMatchesCache = new Map();

export const TECHNICAL_COURSE_COUNT = TECHNICAL_COURSE_CATALOG.length;

const GENERIC_COURSE_TERMS = new Set([
  "CURSO",
  "CURSOS",
  "ENSINO",
  "INTEGRADO",
  "PROFISSIONAL",
  "PROFISSIONAIS",
  "PROFISSIONALIZANTE",
  "PROFISSIONALIZANTES",
  "TECNICA",
  "TECNICAS",
  "TECNICO",
  "TECNICOS",
]);

const CONNECTIVE_COURSE_TERMS = new Set([
  "A",
  "AO",
  "AS",
  "DA",
  "DAS",
  "DE",
  "DO",
  "DOS",
  "E",
  "EM",
  "O",
  "OS",
]);

const COURSE_PREFIXES = [
  ["CURSO", "TECNICO", "EM"],
  ["CURSO", "TECNICO", "DE"],
  ["CURSO", "TECNICO"],
  ["CURSO", "DE"],
  ["CURSO"],
  ["ENSINO", "MEDIO", "INTEGRADO", "EM"],
  ["ENSINO", "MEDIO", "INTEGRADO", "A"],
  ["TECNICO", "EM"],
  ["TECNICO", "DE"],
  ["TECNICO"],
  ["TECNICA", "EM"],
  ["TECNICA", "DE"],
  ["TECNICA"],
  ["TECNOLOGIA", "EM"],
];

export function normalizeDisplayText(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function collapseInitials(value) {
  const terms = value.split(" ").filter(Boolean);
  const collapsed = [];

  for (let index = 0; index < terms.length;) {
    if (!/^[A-Z]$/.test(terms[index])) {
      collapsed.push(terms[index]);
      index += 1;
      continue;
    }

    let end = index;
    while (end < terms.length && /^[A-Z]$/.test(terms[end])) {
      end += 1;
    }

    collapsed.push(
      end - index > 1
        ? terms.slice(index, end).join("")
        : terms[index],
    );
    index = end;
  }

  return collapsed.join(" ");
}

export function normalizeIdentityText(value) {
  return normalizeDisplayText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleUpperCase("pt-BR");
}

function startsWithTerms(terms, prefix) {
  return prefix.every((term, index) => terms[index] === term);
}

function removeCoursePrefix(terms) {
  const prefix = COURSE_PREFIXES.find((candidate) =>
    startsWithTerms(terms, candidate),
  );

  return prefix ? terms.slice(prefix.length) : terms;
}

function singularizeTerm(term) {
  if (term.length <= 4) return term;

  if (term.endsWith("OES") || term.endsWith("AES")) {
    return `${term.slice(0, -3)}AO`;
  }

  if (term.endsWith("AIS")) {
    return `${term.slice(0, -3)}AL`;
  }

  if (term.endsWith("EIS")) {
    return `${term.slice(0, -3)}EL`;
  }

  if (term.length > 5 && (
    term.endsWith("RES") ||
    term.endsWith("ZES")
  )) {
    return term.slice(0, -2);
  }

  if (/[AEIOU]S$/.test(term)) {
    return term.slice(0, -1);
  }

  return term;
}

function baseCourseKey(value) {
  return removeCoursePrefix(
    collapseInitials(normalizeIdentityText(value))
      .split(" ")
      .filter(Boolean),
  )
    .filter((term) =>
      !GENERIC_COURSE_TERMS.has(term) &&
      !CONNECTIVE_COURSE_TERMS.has(term),
    )
    .map(singularizeTerm)
    .join(" ");
}

function basicCourseIdentityKey(value) {
  const baseKey = baseCourseKey(value);
  const canonicalKey = COURSE_ALIASES.get(baseKey) ?? baseKey;

  return canonicalKey.toLocaleLowerCase("pt-BR");
}

function isAbbreviationOf(abbreviation, fullName) {
  const abbreviationTerms = abbreviation.split(" ").filter(Boolean);
  const fullNameTerms = fullName.split(" ").filter(Boolean);

  if (abbreviationTerms.length !== 1) return false;

  const shortTerm = abbreviationTerms[0];
  if (fullNameTerms.length >= 2) {
    const initials = fullNameTerms.map((term) => term[0]).join("");
    return shortTerm.length >= 2 &&
      shortTerm.length <= 8 &&
      shortTerm === initials;
  }

  const fullTerm = fullNameTerms[0] ?? "";
  return shortTerm.length >= 3 &&
    shortTerm.length <= 5 &&
    fullTerm.length >= shortTerm.length + 3 &&
    fullTerm.startsWith(shortTerm);
}

function basicCoursesAreEquivalent(first, second) {
  const firstKey = basicCourseIdentityKey(first);
  const secondKey = basicCourseIdentityKey(second);

  if (!firstKey || !secondKey) return firstKey === secondKey;

  const normalizedFirst = firstKey.toLocaleUpperCase("pt-BR");
  const normalizedSecond = secondKey.toLocaleUpperCase("pt-BR");

  return firstKey === secondKey ||
    isAbbreviationOf(normalizedFirst, normalizedSecond) ||
    isAbbreviationOf(normalizedSecond, normalizedFirst);
}

export function getEquivalentTechnicalCourses(value) {
  const identity = basicCourseIdentityKey(value);
  if (!identity) return [];

  const cached = catalogMatchesCache.get(identity);
  if (cached) return cached;

  const exactMatches = TECHNICAL_COURSE_CATALOG.filter((course) =>
    [course.name, ...course.aliases].some(
      (name) => basicCourseIdentityKey(name) === identity,
    ),
  );
  const compactLetters = String(value ?? "").replace(/[^\p{L}]/gu, "");
  const allowsInferredAcronym = !/^\p{L}{1,2}$/u.test(compactLetters);
  const matches = exactMatches.length > 0
    ? exactMatches
    : !allowsInferredAcronym
      ? []
      : TECHNICAL_COURSE_CATALOG.filter((course) =>
          [course.name, ...course.aliases].some(
            (name) => basicCoursesAreEquivalent(value, name),
          ),
        );

  catalogMatchesCache.set(identity, matches);
  return matches;
}

export function resolveTechnicalCourse(value) {
  const matches = getEquivalentTechnicalCourses(value);
  return matches.length === 1 ? matches[0] : null;
}

export function courseIdentityKey(value) {
  const catalogCourse = resolveTechnicalCourse(value);
  return basicCourseIdentityKey(catalogCourse?.name ?? value);
}

export function coursesAreEquivalent(first, second) {
  const firstMatches = getEquivalentTechnicalCourses(first);
  const secondMatches = getEquivalentTechnicalCourses(second);

  if (firstMatches.length > 0 || secondMatches.length > 0) {
    return firstMatches.length === 1 &&
      secondMatches.length === 1 &&
      firstMatches[0].name === secondMatches[0].name;
  }

  return basicCoursesAreEquivalent(first, second);
}

export function findTechnicalCourseMatches(value, limit = 8) {
  const normalizedQuery = normalizeIdentityText(value);
  const queryTerms = normalizedQuery.split(" ").filter(Boolean);

  if (queryTerms.join("").length < 2) return [];

  return TECHNICAL_COURSE_CATALOG
    .map((course) => {
      const variants = [course.name, ...course.aliases].map((name) => {
        const normalizedName = normalizeIdentityText(name);
        const startsWithEveryTerm = queryTerms.every((term) =>
          normalizedName.split(" ").some((word) => word.startsWith(term)),
        );
        const includesEveryTerm = queryTerms.every((term) =>
          normalizedName.includes(term),
        );

        return {
          name,
          score: normalizedName === normalizedQuery
            ? -1
            : normalizedName.startsWith(normalizedQuery)
              ? 0
              : startsWithEveryTerm
                ? 1
                : includesEveryTerm
                  ? 2
                  : null,
        };
      });
      const matchedVariants = variants.filter(({ score }) => score !== null);

      if (matchedVariants.length === 0) return null;

      const bestScore = Math.min(...matchedVariants.map(({ score }) => score));
      const options = variants
        .sort((first, second) =>
          (first.score ?? bestScore + 3) - (second.score ?? bestScore + 3) ||
          first.name.localeCompare(second.name, "pt-BR", { sensitivity: "base" }),
        )
        .map(({ name }) => ({ name }));

      return { bestScore, name: options[0].name, options };
    })
    .filter(Boolean)
    .sort((first, second) =>
      first.bestScore - second.bestScore ||
      first.name.localeCompare(second.name, "pt-BR", { sensitivity: "base" }),
    )
    .flatMap((course) => course.options)
    .slice(0, limit);
}

export function schoolIdentityKey(value) {
  return collapseInitials(normalizeIdentityText(value)).replace(
    /^(EEEP|ESCOLA\s+ESTADUAL\s+DE\s+EDUCACAO\s+PROFISSIONAL)\s+/,
    "",
  );
}

export function classNameIdentityKey(value) {
  return collapseInitials(normalizeIdentityText(value))
    .replace(/^TURMA\s+(?=.+)/, "")
    .replace(/\s+/g, "");
}

function schoolGroupIdentityKey(
  name,
  city,
  cityUf = "",
  municipalityId = "",
  codigoInep = "",
) {
  const officialCode = normalizeDisplayText(codigoInep);
  if (officialCode) return `INEP:${officialCode}`;

  const cityIdentity = municipalityId
    ? `IBGE:${municipalityId}`
    : `${normalizeIdentityText(city)}:${normalizeIdentityText(cityUf)}`;

  return [
    schoolIdentityKey(name),
    cityIdentity,
  ].join("|||");
}

export function classroomIdentityKey(classroom) {
  return [
    schoolGroupIdentityKey(
      classroom.nomeEscola,
      classroom.cidade,
      classroom.cidadeUf,
      classroom.municipioIbgeId,
      classroom.codigoInep,
    ),
    normalizeDisplayText(classroom.etapaEnsino).toLocaleUpperCase("pt-BR"),
    Number(classroom.serie),
    courseIdentityKey(classroom.cursoNome) || REGULAR_COURSE_KEY,
    classNameIdentityKey(classroom.turma),
  ].join("|||");
}

export function classroomsAreEquivalent(first, second) {
  const firstCourse = normalizeDisplayText(first.cursoNome);
  const secondCourse = normalizeDisplayText(second.cursoNome);
  const equivalentCourses = !firstCourse || !secondCourse
    ? firstCourse === secondCourse
    : coursesAreEquivalent(firstCourse, secondCourse);

  return schoolGroupIdentityKey(
    first.nomeEscola,
    first.cidade,
    first.cidadeUf,
    first.municipioIbgeId,
    first.codigoInep,
  ) === schoolGroupIdentityKey(
    second.nomeEscola,
    second.cidade,
    second.cidadeUf,
    second.municipioIbgeId,
    second.codigoInep,
  ) &&
    normalizeDisplayText(first.etapaEnsino).toLocaleUpperCase("pt-BR") ===
      normalizeDisplayText(second.etapaEnsino).toLocaleUpperCase("pt-BR") &&
    Number(first.serie) === Number(second.serie) &&
    classNameIdentityKey(first.turma) === classNameIdentityKey(second.turma) &&
    equivalentCourses;
}

export function groupClassroomsBySchool(classrooms) {
  const schools = new Map();
  const sourceClassroomsBySchool = new Map();

  classrooms.forEach((classroom) => {
    const name = normalizeDisplayText(classroom.nomeEscola);
    const city = normalizeDisplayText(classroom.cidade) || "Não informada";
    const cityUf = normalizeDisplayText(classroom.cidadeUf).toUpperCase();
    const municipalityId = normalizeDisplayText(classroom.municipioIbgeId);
    const codigoInep = normalizeDisplayText(classroom.codigoInep);
    const key = schoolGroupIdentityKey(
      name,
      city,
      cityUf,
      municipalityId,
      codigoInep,
    );

    if (!schools.has(key)) {
      schools.set(key, {
        nomeEscola: name,
        cidade: city,
        ...(cityUf ? { cidadeUf: cityUf } : {}),
        ...(municipalityId ? { municipioIbgeId: municipalityId } : {}),
        ...(codigoInep ? { codigoInep } : {}),
        turmas: [],
      });
      sourceClassroomsBySchool.set(key, []);
    }

    const courseName = normalizeDisplayText(classroom.cursoNome);
    const organizationType = classroom.tipoOrganizacao ?? (
      courseName ? "TECNICA" : "REGULAR"
    );
    const classOrganization = classroom.organizacaoTurma ?? (
      classNameIdentityKey(classroom.turma) === "UNICA"
        ? "UNICA"
        : "DIVIDIDA"
    );
    const normalizedClassroom = {
      etapaEnsino: normalizeDisplayText(classroom.etapaEnsino)
        .toLocaleUpperCase("pt-BR"),
      tipoOrganizacao: organizationType,
      organizacaoTurma: classOrganization,
      ...(courseName
        ? { cursoNome: courseName }
        : {}),
      serie: Number(classroom.serie),
      turma: classOrganization === "UNICA"
        ? "UNICA"
        : normalizeDisplayText(classroom.turma),
    };
    const comparableClassroom = {
      ...normalizedClassroom,
      cidade: city,
      cidadeUf: cityUf,
      municipioIbgeId: municipalityId,
      codigoInep,
      nomeEscola: name,
    };

    if (sourceClassroomsBySchool.get(key).some(
      (existing) => classroomsAreEquivalent(existing, comparableClassroom),
    )) {
      throw new Error(
        "Não foi possível cadastrar: há turmas equivalentes na mesma escola e cidade.",
      );
    }

    sourceClassroomsBySchool.get(key).push(comparableClassroom);
    schools.get(key).turmas.push(normalizedClassroom);
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
