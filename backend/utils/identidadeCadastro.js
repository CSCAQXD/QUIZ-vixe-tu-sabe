const { chaveEntidade } = require("./sanitize");
const cursosTecnicos = require("../../shared/cursosTecnicos.json");

const CURSO_REGULAR = "SEM_CURSO";

const CONECTORES_CURSO = new Set([
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

const TERMOS_GENERICOS_CURSO = new Set([
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

const PREFIXOS_CURSO = [
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

const ALIASES_CURSO = new Map([
    ["REDE", "REDE COMPUTADOR"],
    ["REDE COMPUTADOR", "REDE COMPUTADOR"],
    ["REDE COMPUTACIONAL", "REDE COMPUTADOR"],
]);

const CATALOGO_CURSOS_TECNICOS = cursosTecnicos.map((item) =>
    typeof item === "string"
        ? { nome: item, aliases: [] }
        : {
              nome: item.nome,
              aliases: Array.isArray(item.aliases) ? item.aliases : [],
          },
);

const cacheCorrespondenciasCatalogo = new Map();

function compactarIniciais(valor) {
    const termos = String(valor ?? "")
        .split(" ")
        .filter(Boolean);
    const compactados = [];

    for (let indice = 0; indice < termos.length; ) {
        if (!/^[A-Z]$/.test(termos[indice])) {
            compactados.push(termos[indice]);
            indice += 1;
            continue;
        }

        let fim = indice;
        while (fim < termos.length && /^[A-Z]$/.test(termos[fim])) {
            fim += 1;
        }

        compactados.push(fim - indice > 1 ? termos.slice(indice, fim).join("") : termos[indice]);
        indice = fim;
    }

    return compactados.join(" ");
}

function comecaCom(lista, prefixo) {
    return prefixo.every((termo, indice) => lista[indice] === termo);
}

function removerPrefixoCurso(termos) {
    const prefixo = PREFIXOS_CURSO.find((candidato) => comecaCom(termos, candidato));

    return prefixo ? termos.slice(prefixo.length) : termos;
}

function singularizarTermo(termo) {
    if (termo.length <= 4) return termo;

    if (termo.endsWith("OES") || termo.endsWith("AES")) {
        return `${termo.slice(0, -3)}AO`;
    }

    if (termo.endsWith("AIS")) {
        return `${termo.slice(0, -3)}AL`;
    }

    if (termo.endsWith("EIS")) {
        return `${termo.slice(0, -3)}EL`;
    }

    if (termo.length > 5 && (termo.endsWith("RES") || termo.endsWith("ZES"))) {
        return termo.slice(0, -2);
    }

    if (/[AEIOU]S$/.test(termo)) {
        return termo.slice(0, -1);
    }

    return termo;
}

function obterTermosCurso(valor) {
    return removerPrefixoCurso(compactarIniciais(chaveEntidade(valor)).split(" ").filter(Boolean))
        .filter((termo) => !CONECTORES_CURSO.has(termo) && !TERMOS_GENERICOS_CURSO.has(termo))
        .map(singularizarTermo);
}

function normalizarCurso(valor) {
    const termos = obterTermosCurso(valor);

    const identidade = termos.join(" ");
    const canonica = ALIASES_CURSO.get(identidade) || identidade;

    return canonica.toLowerCase();
}

function normalizarTurma(valor) {
    return compactarIniciais(chaveEntidade(valor))
        .replace(/^TURMA\s+/, "")
        .replace(/\s+/g, "");
}

function ehAbreviacaoDe(abreviacao, nomeCompleto) {
    const termosAbreviacao = abreviacao.split(" ").filter(Boolean);
    const termosNomeCompleto = nomeCompleto.split(" ").filter(Boolean);

    if (termosAbreviacao.length !== 1) return false;

    const termoCurto = termosAbreviacao[0];
    if (termosNomeCompleto.length >= 2) {
        const sigla = termosNomeCompleto.map((termo) => termo[0]).join("");

        return termoCurto.length >= 2 && termoCurto.length <= 8 && termoCurto === sigla;
    }

    const termoCompleto = termosNomeCompleto[0] || "";
    return (
        termoCurto.length >= 3 &&
        termoCurto.length <= 5 &&
        termoCompleto.length >= termoCurto.length + 3 &&
        termoCompleto.startsWith(termoCurto)
    );
}

function cursosSaoEquivalentes(primeiro, segundo) {
    const primeiraIdentidade = normalizarCurso(primeiro);
    const segundaIdentidade = normalizarCurso(segundo);

    if (!primeiraIdentidade || !segundaIdentidade) {
        return primeiraIdentidade === segundaIdentidade;
    }

    const correspondenciasPrimeiro = buscarCursosCatalogoEquivalentes(primeiro);
    const correspondenciasSegundo = buscarCursosCatalogoEquivalentes(segundo);

    if (correspondenciasPrimeiro.length > 0 || correspondenciasSegundo.length > 0) {
        return (
            correspondenciasPrimeiro.length === 1 &&
            correspondenciasSegundo.length === 1 &&
            correspondenciasPrimeiro[0].nome === correspondenciasSegundo[0].nome
        );
    }

    return (
        primeiraIdentidade === segundaIdentidade ||
        ehAbreviacaoDe(primeiraIdentidade.toUpperCase(), segundaIdentidade.toUpperCase()) ||
        ehAbreviacaoDe(segundaIdentidade.toUpperCase(), primeiraIdentidade.toUpperCase())
    );
}

function identidadesBasicasSaoEquivalentes(primeiro, segundo) {
    const primeiraIdentidade = normalizarCurso(primeiro);
    const segundaIdentidade = normalizarCurso(segundo);

    if (!primeiraIdentidade || !segundaIdentidade) {
        return primeiraIdentidade === segundaIdentidade;
    }

    return (
        primeiraIdentidade === segundaIdentidade ||
        ehAbreviacaoDe(primeiraIdentidade.toUpperCase(), segundaIdentidade.toUpperCase()) ||
        ehAbreviacaoDe(segundaIdentidade.toUpperCase(), primeiraIdentidade.toUpperCase())
    );
}

function buscarCursosCatalogoEquivalentes(valor) {
    const identidade = normalizarCurso(valor);
    if (!identidade) return [];

    const armazenada = cacheCorrespondenciasCatalogo.get(identidade);
    if (armazenada) return armazenada;

    const exatas = CATALOGO_CURSOS_TECNICOS.filter((curso) =>
        [curso.nome, ...curso.aliases].some((nome) => normalizarCurso(nome) === identidade),
    );
    const permiteSiglaInferida = !/^\p{L}{1,2}$/u.test(
        String(valor ?? "").replace(/[^\p{L}]/gu, ""),
    );
    const correspondencias =
        exatas.length > 0
            ? exatas
            : !permiteSiglaInferida
              ? []
              : CATALOGO_CURSOS_TECNICOS.filter((curso) =>
                    [curso.nome, ...curso.aliases].some((nome) =>
                        identidadesBasicasSaoEquivalentes(valor, nome),
                    ),
                );

    cacheCorrespondenciasCatalogo.set(identidade, correspondencias);
    return correspondencias;
}

function resolverCursoCatalogo(valor) {
    const correspondencias = buscarCursosCatalogoEquivalentes(valor);
    return correspondencias.length === 1 ? correspondencias[0] : null;
}

function obterIdentidadeCurso(cursoNome) {
    const cursoCatalogo = resolverCursoCatalogo(cursoNome);
    const identidade = normalizarCurso(cursoCatalogo?.nome || cursoNome);
    return identidade || CURSO_REGULAR;
}

function obterIdentidadeTurma({ etapaEnsino, serie, turma, cursoNome, cursoBusca } = {}) {
    return [
        String(etapaEnsino ?? "FUNDAMENTAL")
            .trim()
            .toUpperCase(),
        Number(serie),
        cursoBusca || obterIdentidadeCurso(cursoNome),
        normalizarTurma(turma),
    ].join("|||");
}

function encontrarTurmaDuplicada(turmas = []) {
    for (let segundoIndice = 0; segundoIndice < turmas.length; segundoIndice += 1) {
        const segundaTurma = turmas[segundoIndice];

        for (let primeiroIndice = 0; primeiroIndice < segundoIndice; primeiroIndice += 1) {
            const primeiraTurma = turmas[primeiroIndice];
            const primeiroCurso =
                primeiraTurma.cursoBusca || obterIdentidadeCurso(primeiraTurma.cursoNome);
            const segundoCurso =
                segundaTurma.cursoBusca || obterIdentidadeCurso(segundaTurma.cursoNome);
            const cursosEquivalentes =
                primeiroCurso === CURSO_REGULAR || segundoCurso === CURSO_REGULAR
                    ? primeiroCurso === segundoCurso
                    : cursosSaoEquivalentes(primeiroCurso, segundoCurso);

            if (
                String(primeiraTurma.etapaEnsino ?? "FUNDAMENTAL")
                    .trim()
                    .toUpperCase() ===
                    String(segundaTurma.etapaEnsino ?? "FUNDAMENTAL")
                        .trim()
                        .toUpperCase() &&
                Number(primeiraTurma.serie) === Number(segundaTurma.serie) &&
                normalizarTurma(primeiraTurma.turma) === normalizarTurma(segundaTurma.turma) &&
                cursosEquivalentes
            ) {
                return {
                    primeiroIndice,
                    segundoIndice,
                    identidade: obterIdentidadeTurma(primeiraTurma),
                };
            }
        }
    }

    return null;
}

module.exports = {
    CATALOGO_CURSOS_TECNICOS,
    CURSO_REGULAR,
    buscarCursosCatalogoEquivalentes,
    cursosSaoEquivalentes,
    encontrarTurmaDuplicada,
    normalizarCurso,
    normalizarTurma,
    obterIdentidadeCurso,
    obterIdentidadeTurma,
    resolverCursoCatalogo,
};
