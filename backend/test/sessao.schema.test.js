const test = require("node:test");
const assert = require("node:assert/strict");

const { validarSessao } = require("../schemas/sessao.schema");
const { criarContextoQuiz, LIMITE_CONTEXTO_QUIZ } = require("../utils/contextoQuiz");

const ID_PARTIDA = "550e8400-e29b-41d4-a716-446655440000";

function criarSessaoValida(alteracoes = {}) {
    return {
        idempotencyKey: ID_PARTIDA,
        nomeEscola: "EEEP Maria Cavalcante Costa",
        cidade: "Quixadá",
        pontuacaoFinal: 100,
        contextoQuiz: "contexto-teste.assinatura-teste",
        serie: 9,
        turma: "A",
        ...alteracoes,
    };
}

test("normaliza uma partida com uma única turma", () => {
    const resultado = validarSessao(
        criarSessaoValida({
            nomeEscola: "  Escola Teste  ",
            cidade: "  Quixadá  ",
            serie: "9",
            turma: "  A  ",
            pontuacaoFinal: "100",
        }),
    );

    assert.deepEqual(resultado, {
        idempotencyKey: ID_PARTIDA,
        nomeEscola: "Escola Teste",
        cidade: "Quixadá",
        cidadeUf: "CE",
        municipioIbgeId: "2311306",
        pontuacaoFinal: 100,
        contextoQuiz: "contexto-teste.assinatura-teste",
        turmas: [
            {
                etapaEnsino: "FUNDAMENTAL",
                serie: 9,
                turma: "A",
            },
        ],
    });
});

test("aceita várias turmas diferentes", () => {
    const resultado = validarSessao(
        criarSessaoValida({
            serie: undefined,
            turma: undefined,
            turmas: [
                {
                    serie: 8,
                    turma: "A",
                },
                {
                    serie: 8,
                    turma: "B",
                },
                {
                    serie: 9,
                    turma: "A",
                },
            ],
        }),
    );

    assert.equal(resultado.turmas.length, 3);

    assert.deepEqual(resultado.turmas, [
        {
            etapaEnsino: "FUNDAMENTAL",
            serie: 8,
            turma: "A",
        },
        {
            etapaEnsino: "FUNDAMENTAL",
            serie: 8,
            turma: "B",
        },
        {
            etapaEnsino: "FUNDAMENTAL",
            serie: 9,
            turma: "A",
        },
    ]);
});

test("aceita pontuação final igual a zero", () => {
    const resultado = validarSessao(
        criarSessaoValida({
            pontuacaoFinal: 0,
        }),
    );

    assert.equal(resultado.pontuacaoFinal, 0);
});

test("preserva um código INEP válido da escola", () => {
    const resultado = validarSessao(
        criarSessaoValida({
            codigoInep: "23000001",
        }),
    );

    assert.equal(resultado.codigoInep, "23000001");
});

test("rejeita código INEP com formato inválido", () => {
    assert.throws(() => validarSessao(criarSessaoValida({ codigoInep: "2301" })), /8 números/);
});

test("rejeita chave de idempotência ausente", () => {
    assert.throws(
        () =>
            validarSessao(
                criarSessaoValida({
                    idempotencyKey: "",
                }),
            ),
        /idempotencyKey/,
    );
});

test("rejeita pontuação final negativa", () => {
    assert.throws(
        () =>
            validarSessao(
                criarSessaoValida({
                    pontuacaoFinal: -1,
                }),
            ),
        /pontuacaoFinal/,
    );
});

test("rejeita pontuação final decimal", () => {
    assert.throws(
        () =>
            validarSessao(
                criarSessaoValida({
                    pontuacaoFinal: 10.5,
                }),
            ),
        /pontuacaoFinal/,
    );
});

test("rejeita turma duplicada sem diferenciar maiúsculas", () => {
    assert.throws(
        () =>
            validarSessao(
                criarSessaoValida({
                    serie: undefined,
                    turma: undefined,
                    turmas: [
                        {
                            serie: 9,
                            turma: "a",
                        },
                        {
                            serie: 9,
                            turma: "A",
                        },
                    ],
                }),
            ),
        /repetir/,
    );
});

test("permite o mesmo nome de turma em séries diferentes", () => {
    const resultado = validarSessao(
        criarSessaoValida({
            serie: undefined,
            turma: undefined,
            turmas: [
                {
                    serie: 8,
                    turma: "A",
                },
                {
                    serie: 9,
                    turma: "A",
                },
            ],
        }),
    );

    assert.equal(resultado.turmas.length, 2);
});

test("rejeita série fora do intervalo permitido", () => {
    assert.throws(
        () =>
            validarSessao(
                criarSessaoValida({
                    serie: 13,
                }),
            ),
        /entre 1 e 9/,
    );
});

test("distingue o terceiro ano fundamental do terceiro ano médio", () => {
    const resultado = validarSessao(
        criarSessaoValida({
            serie: undefined,
            turma: undefined,
            turmas: [
                {
                    etapaEnsino: "FUNDAMENTAL",
                    serie: 3,
                    turma: "A",
                },
                {
                    etapaEnsino: "MEDIO",
                    serie: 3,
                    turma: "A",
                },
            ],
        }),
    );

    assert.equal(resultado.turmas.length, 2);
});

test("rejeita série acima do terceiro ano do ensino médio", () => {
    assert.throws(
        () =>
            validarSessao(
                criarSessaoValida({
                    etapaEnsino: "MEDIO",
                    serie: 4,
                }),
            ),
        /entre 1 e 3/,
    );
});

test("rejeita nome de escola com menos de três letras", () => {
    assert.throws(
        () =>
            validarSessao(
                criarSessaoValida({
                    nomeEscola: "AB",
                }),
            ),
        /pelo menos 3/,
    );
});

test("rejeita escola sem nome", () => {
    assert.throws(
        () =>
            validarSessao(
                criarSessaoValida({
                    nomeEscola: "   ",
                }),
            ),
        /nome da escola/,
    );
});

test("rejeita cidade vazia", () => {
    assert.throws(
        () =>
            validarSessao(
                criarSessaoValida({
                    cidade: "",
                }),
            ),
        /cidade/,
    );
});

test("rejeita mais de vinte turmas", () => {
    const turmas = Array.from(
        {
            length: 21,
        },
        (_, indice) => ({
            serie: 9,
            turma: `TURMA-${indice + 1}`,
        }),
    );

    assert.throws(
        () =>
            validarSessao(
                criarSessaoValida({
                    serie: undefined,
                    turma: undefined,
                    turmas,
                }),
            ),
        /máximo 20 turmas/,
    );
});

test("aceita curso técnico sem misturá-lo à divisão", () => {
    const resultado = validarSessao(
        criarSessaoValida({
            cursoNome: "  Redes de Computadores  ",
            serie: 2,
            turma: "Única",
        }),
    );

    assert.equal(resultado.turmas[0].cursoNome, "Redes de Computadores");
    assert.equal(resultado.turmas[0].turma, "UNICA");
});

test("aceita sigla reconhecida e rejeita sigla curta fora do catálogo", () => {
    const resultado = validarSessao(criarSessaoValida({ cursoNome: "RH" }));
    assert.equal(resultado.turmas[0].cursoNome, "RH");

    assert.throws(() => validarSessao(criarSessaoValida({ cursoNome: "TI" })), /curso da turma 1/);
});

test("rejeita abreviação que pode representar mais de um curso do catálogo", () => {
    assert.throws(() => validarSessao(criarSessaoValida({ cursoNome: "MEC" })), /ambíguo/);
});

test("permite um curso novo que não existe no catálogo", () => {
    const resultado = validarSessao(
        criarSessaoValida({
            cursoNome: "Tecnologia Subaquática",
        }),
    );

    assert.equal(resultado.turmas[0].cursoNome, "Tecnologia Subaquática");
});

test("rejeita turmas equivalentes por sigla e nome expandido do curso", () => {
    assert.throws(
        () =>
            validarSessao(
                criarSessaoValida({
                    serie: undefined,
                    turma: undefined,
                    turmas: [
                        {
                            etapaEnsino: "MEDIO",
                            serie: 1,
                            turma: "A-1",
                            cursoNome: "ADS",
                        },
                        {
                            etapaEnsino: "MEDIO",
                            serie: 1,
                            turma: "turma a 1",
                            cursoNome: "Análise e Desenvolvimento de Sistemas",
                        },
                    ],
                }),
            ),
        /representam a mesma etapa, série, curso e divisão/,
    );
});

test("mantém especializações diferentes como cursos distintos", () => {
    const resultado = validarSessao(
        criarSessaoValida({
            serie: undefined,
            turma: undefined,
            turmas: [
                {
                    etapaEnsino: "MEDIO",
                    serie: 1,
                    turma: "UNICA",
                    cursoNome: "Administração",
                },
                {
                    etapaEnsino: "MEDIO",
                    serie: 1,
                    turma: "UNICA",
                    cursoNome: "Administração Pública",
                },
            ],
        }),
    );

    assert.equal(resultado.turmas.length, 2);
});

test("valida coerência entre tipo de organização, curso e divisão", () => {
    assert.throws(
        () =>
            validarSessao(
                criarSessaoValida({
                    tipoOrganizacao: "TECNICA",
                    cursoNome: "",
                }),
            ),
        /Informe o curso profissionalizante/,
    );
    assert.throws(
        () =>
            validarSessao(
                criarSessaoValida({
                    tipoOrganizacao: "REGULAR",
                    cursoNome: "Administração",
                }),
            ),
        /não deve possuir curso profissionalizante/,
    );
    assert.throws(
        () =>
            validarSessao(
                criarSessaoValida({
                    organizacaoTurma: "DIVIDIDA",
                    turma: "Única",
                }),
            ),
        /DIVIDIDA não pode usar/,
    );
});

test("exige um contexto textual válido e limitado sem decodificar o conteúdo", () => {
    for (const contextoQuiz of [
        undefined,
        "",
        {},
        123,
        "sem-separador",
        "a.b",
        `${"a".repeat(LIMITE_CONTEXTO_QUIZ)}.b`,
    ]) {
        assert.throws(() => validarSessao(criarSessaoValida({ contextoQuiz })), /contexto do quiz/);
    }
    const contextoQuiz = "contexto-teste.assinatura-teste";
    assert.equal(
        validarSessao(criarSessaoValida({ contextoQuiz: `  ${contextoQuiz}  ` })).contextoQuiz,
        contextoQuiz,
    );
});

test("aceita o contexto com cem turmas globais no registro de uma escola", () => {
    const participantes = Array.from({ length: 100 }, () => ({
        etapaEnsino: "FUNDAMENTAL",
        serie: 9,
    }));
    const { contextoQuiz } = criarContextoQuiz(participantes);
    assert.ok(contextoQuiz.length <= LIMITE_CONTEXTO_QUIZ);
    assert.equal(validarSessao(criarSessaoValida({ contextoQuiz })).contextoQuiz, contextoQuiz);
});
