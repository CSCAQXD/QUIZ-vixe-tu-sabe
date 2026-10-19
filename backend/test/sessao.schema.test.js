const test = require("node:test");
const assert = require("node:assert/strict");

const {
    validarSessao,
} = require("../schemas/sessao.schema");
const { criarContextoQuiz, LIMITE_CONTEXTO_QUIZ } = require("../utils/contextoQuiz");

const ID_PARTIDA =
    "550e8400-e29b-41d4-a716-446655440000";

function criarSessaoValida(
    alteracoes = {}
) {
    return {
        idempotencyKey: ID_PARTIDA,
        nomeEscola:
            "EEEP Maria Cavalcante Costa",
        cidade: "Quixadá",
        pontuacaoFinal: 100,
        contextoQuiz: "contexto-teste.assinatura-teste",
        serie: 9,
        turma: "A",
        ...alteracoes,
    };
}

test(
    "normaliza uma partida com uma única turma",
    () => {
        const resultado =
            validarSessao(
                criarSessaoValida({
                    nomeEscola:
                        "  Escola Teste  ",
                    cidade:
                        "  Quixadá  ",
                    serie: "9",
                    turma: "  A  ",
                    pontuacaoFinal:
                        "100",
                })
            );

        assert.deepEqual(
            resultado,
            {
                idempotencyKey:
                    ID_PARTIDA,
                nomeEscola:
                    "Escola Teste",
                cidade: "Quixadá",
                pontuacaoFinal: 100,
                contextoQuiz: "contexto-teste.assinatura-teste",
                turmas: [
                    {
                        etapaEnsino:
                            "FUNDAMENTAL",
                        serie: 9,
                        turma: "A",
                    },
                ],
            }
        );
    }
);

test(
    "aceita várias turmas diferentes",
    () => {
        const resultado =
            validarSessao(
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
                })
            );

        assert.equal(
            resultado.turmas.length,
            3
        );

        assert.deepEqual(
            resultado.turmas,
            [
                {
                    etapaEnsino:
                        "FUNDAMENTAL",
                    serie: 8,
                    turma: "A",
                },
                {
                    etapaEnsino:
                        "FUNDAMENTAL",
                    serie: 8,
                    turma: "B",
                },
                {
                    etapaEnsino:
                        "FUNDAMENTAL",
                    serie: 9,
                    turma: "A",
                },
            ]
        );
    }
);

test(
    "aceita pontuação final igual a zero",
    () => {
        const resultado =
            validarSessao(
                criarSessaoValida({
                    pontuacaoFinal: 0,
                })
            );

        assert.equal(
            resultado.pontuacaoFinal,
            0
        );
    }
);

test(
    "rejeita chave de idempotência ausente",
    () => {
        assert.throws(
            () =>
                validarSessao(
                    criarSessaoValida({
                        idempotencyKey: "",
                    })
                ),
            /idempotencyKey/
        );
    }
);

test(
    "rejeita pontuação final negativa",
    () => {
        assert.throws(
            () =>
                validarSessao(
                    criarSessaoValida({
                        pontuacaoFinal: -1,
                    })
                ),
            /pontuacaoFinal/
        );
    }
);

test(
    "rejeita pontuação final decimal",
    () => {
        assert.throws(
            () =>
                validarSessao(
                    criarSessaoValida({
                        pontuacaoFinal:
                            10.5,
                    })
                ),
            /pontuacaoFinal/
        );
    }
);

test(
    "rejeita turma duplicada sem diferenciar maiúsculas",
    () => {
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
                    })
                ),
            /repetir/
        );
    }
);

test(
    "permite o mesmo nome de turma em séries diferentes",
    () => {
        const resultado =
            validarSessao(
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
                })
            );

        assert.equal(
            resultado.turmas.length,
            2
        );
    }
);

test(
    "rejeita série fora do intervalo permitido",
    () => {
        assert.throws(
            () =>
                validarSessao(
                    criarSessaoValida({
                        serie: 13,
                    })
                ),
            /entre 1 e 9/
        );
    }
);

test(
    "distingue o terceiro ano fundamental do terceiro ano médio",
    () => {
        const resultado =
            validarSessao(
                criarSessaoValida({
                    serie: undefined,
                    turma: undefined,
                    turmas: [
                        {
                            etapaEnsino:
                                "FUNDAMENTAL",
                            serie: 3,
                            turma: "A",
                        },
                        {
                            etapaEnsino:
                                "MEDIO",
                            serie: 3,
                            turma: "A",
                        },
                    ],
                })
            );

        assert.equal(
            resultado.turmas.length,
            2
        );
    }
);

test(
    "rejeita série acima do terceiro ano do ensino médio",
    () => {
        assert.throws(
            () =>
                validarSessao(
                    criarSessaoValida({
                        etapaEnsino:
                            "MEDIO",
                        serie: 4,
                    })
                ),
            /entre 1 e 3/
        );
    }
);

test(
    "rejeita nome de escola com menos de três letras",
    () => {
        assert.throws(
            () =>
                validarSessao(
                    criarSessaoValida({
                        nomeEscola: "AB",
                    })
                ),
            /pelo menos 3/
        );
    }
);

test(
    "rejeita escola sem nome",
    () => {
        assert.throws(
            () =>
                validarSessao(
                    criarSessaoValida({
                        nomeEscola: "   ",
                    })
                ),
            /nome da escola/
        );
    }
);

test(
    "rejeita cidade vazia",
    () => {
        assert.throws(
            () =>
                validarSessao(
                    criarSessaoValida({
                        cidade: "",
                    })
                ),
            /cidade/
        );
    }
);

test(
    "rejeita mais de vinte turmas",
    () => {
        const turmas =
            Array.from(
                {
                    length: 21,
                },
                (_, indice) => ({
                    serie: 9,
                    turma: `TURMA-${indice + 1}`,
                })
            );

        assert.throws(
            () =>
                validarSessao(
                    criarSessaoValida({
                        serie: undefined,
                        turma: undefined,
                        turmas,
                    })
                ),
            /máximo 20 turmas/
        );
    }
);

test("aceita curso técnico sem misturá-lo à divisão", () => {
    const resultado = validarSessao(criarSessaoValida({
        cursoNome: "  Redes de Computadores  ",
        serie: 2,
        turma: "Única",
    }));

    assert.equal(resultado.turmas[0].cursoNome, "Redes de Computadores");
    assert.equal(resultado.turmas[0].turma, "Única");
});

test("rejeita nome de curso muito curto", () => {
    assert.throws(
        () => validarSessao(criarSessaoValida({ cursoNome: "TI" })),
        /curso da turma 1/
    );
});

test("exige um contexto textual válido e limitado sem decodificar o conteúdo", () => {
    for (const contextoQuiz of [undefined, "", {}, 123, "sem-separador", "a.b",
        `${"a".repeat(LIMITE_CONTEXTO_QUIZ)}.b`]) {
        assert.throws(() => validarSessao(criarSessaoValida({ contextoQuiz })), /contexto do quiz/);
    }
    const contextoQuiz = "contexto-teste.assinatura-teste";
    assert.equal(validarSessao(criarSessaoValida({ contextoQuiz: `  ${contextoQuiz}  ` })).contextoQuiz,
        contextoQuiz);
});

test("aceita o contexto com cem turmas globais no registro de uma escola", () => {
    const participantes = Array.from({ length: 100 }, () => ({ etapaEnsino: "FUNDAMENTAL", serie: 9 }));
    const { contextoQuiz } = criarContextoQuiz(participantes);
    assert.ok(contextoQuiz.length <= LIMITE_CONTEXTO_QUIZ);
    assert.equal(validarSessao(criarSessaoValida({ contextoQuiz })).contextoQuiz, contextoQuiz);
});
