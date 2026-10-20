const test = require("node:test");
const assert = require("node:assert/strict");

const {
    buscarCursosCatalogoEquivalentes,
    CATALOGO_CURSOS_TECNICOS,
    cursosSaoEquivalentes,
    encontrarTurmaDuplicada,
    normalizarCurso,
    normalizarTurma,
    obterIdentidadeCurso,
} = require("../utils/identidadeCadastro");

test("carrega os 282 cursos enviados em um catálogo único", () => {
    assert.equal(CATALOGO_CURSOS_TECNICOS.length, 282);
});

test("normaliza qualquer curso sem depender de caixa, acento, prefixo ou plural", () => {
    assert.equal(normalizarCurso("Curso técnico em EDIFICAÇÕES"), "edificacao");
    assert.equal(normalizarCurso("edificação"), "edificacao");
    assert.equal(normalizarCurso("Recursos Humanos"), "recurso humano");
});

test("reconhece siglas e abreviações gerais de cursos", () => {
    const equivalentes = [
        ["ADS", "Análise e Desenvolvimento de Sistemas"],
        ["T.I.", "Tecnologia da Informação"],
        ["RH", "Recursos Humanos"],
        ["ADM", "Administração"],
        ["EDIF", "Edificações"],
        ["REDES", "Redes de Computadores"],
    ];

    for (const [primeiro, segundo] of equivalentes) {
        assert.equal(
            cursosSaoEquivalentes(primeiro, segundo),
            true,
            `${primeiro} deveria equivaler a ${segundo}`
        );
    }
});

test("não confunde cursos que possuem especializações diferentes", () => {
    assert.equal(cursosSaoEquivalentes("Administração", "Administração Pública"), false);
    assert.equal(cursosSaoEquivalentes("Informática", "Informática para Internet"), false);
    assert.equal(cursosSaoEquivalentes("Sistemas", "Sistemas de Informação"), false);
});

test("resolve aliases na identidade sem substituir o nome de exibição", () => {
    assert.equal(
        obterIdentidadeCurso("Segurança da Informação"),
        obterIdentidadeCurso("Cibersegurança")
    );
    assert.equal(obterIdentidadeCurso("IoT"), obterIdentidadeCurso("Internet das Coisas"));
    assert.equal(
        obterIdentidadeCurso("Computação em Nuvem"),
        obterIdentidadeCurso("Cloud Computing")
    );
    assert.equal(
        obterIdentidadeCurso("Manutenção de Sistemas Metroferroviários"),
        obterIdentidadeCurso("Manutenção Metroferroviária")
    );
    assert.equal(
        obterIdentidadeCurso("Artes Circenses"),
        obterIdentidadeCurso("Artista de Circo")
    );
    assert.equal(
        obterIdentidadeCurso("Agenciamento de Viagem"),
        obterIdentidadeCurso("Agenciamento de Viagens")
    );
    assert.equal(obterIdentidadeCurso("Tecnologia Subaquática"), "tecnologia subaquatica");
    assert.deepEqual(
        buscarCursosCatalogoEquivalentes("MEC").map((curso) => curso.nome).sort(),
        ["Manobras e Equipamentos de Convés", "Mecatrônica", "Mecânica"].sort()
    );
});

test("normaliza identificações de turma com pontuação e prefixo", () => {
    assert.equal(normalizarTurma("Turma A-1"), normalizarTurma("a 1"));
    assert.equal(normalizarTurma("Única"), "UNICA");
});

test("detecta duplicidade pela identidade completa e preserva cursos distintos", () => {
    const base = {
        etapaEnsino: "MEDIO",
        serie: 1,
        turma: "A",
    };

    assert.deepEqual(
        encontrarTurmaDuplicada([
            { ...base, cursoNome: "RH" },
            { ...base, cursoNome: "Recursos Humanos" },
        ]),
        {
            primeiroIndice: 0,
            segundoIndice: 1,
            identidade: "MEDIO|||1|||recurso humano|||A",
        }
    );
    assert.equal(
        encontrarTurmaDuplicada([
            { ...base, cursoNome: "Administração" },
            { ...base, cursoNome: "Administração Pública" },
        ]),
        null
    );
});
