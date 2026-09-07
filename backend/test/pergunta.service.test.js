const test = require("node:test");
const assert = require("node:assert/strict");
const { mock } = require("node:test");

const perguntaRepository = require(
    "../repositories/pergunta.repository"
);

const perguntaService = require(
    "../services/pergunta.service"
);

function criarPergunta(
    alteracoes = {}
) {
    return {
        id: "1",
        pergunta:
            "Quem foi Cego Aderaldo?",
        altA: "Um poeta",
        altB: "Um arquiteto",
        altC: "Um pintor",
        altD: "Um escultor",
        correta: "A",
        pontosIniciais: "100",
        dica1:
            "Era conhecido pela poesia.",
        dica2: "",
        dica3: "",
        ...alteracoes,
    };
}

test.beforeEach(() => {
    perguntaService.limparCache();
});

test.afterEach(() => {
    mock.restoreAll();
    perguntaService.limparCache();
});

test(
    "transforma corretamente uma pergunta da planilha",
    async () => {
        mock.method(
            perguntaRepository,
            "buscarDaPlanilha",
            async () => [
                criarPergunta(),
            ]
        );

        const perguntas =
            await perguntaService
                .listarPerguntas();

        assert.deepEqual(
            perguntas,
            [
                {
                    id: "1",
                    pergunta:
                        "Quem foi Cego Aderaldo?",
                    opcoes: [
                        "Um poeta",
                        "Um arquiteto",
                        "Um pintor",
                        "Um escultor",
                    ],
                    correta: "A",
                    pontosIniciais:
                        100,
                    dicas: [
                        "Era conhecido pela poesia.",
                    ],
                },
            ]
        );
    }
);

test(
    "utiliza o cache na segunda consulta",
    async () => {
        const buscar =
            mock.method(
                perguntaRepository,
                "buscarDaPlanilha",
                async () => [
                    criarPergunta(),
                ]
            );

        await perguntaService
            .listarPerguntas();

        await perguntaService
            .listarPerguntas();

        assert.equal(
            buscar.mock.callCount(),
            1
        );
    }
);

test(
    "reutiliza o cache se a planilha ficar indisponível",
    async () => {
        let quantidadeChamadas = 0;

        mock.method(
            perguntaRepository,
            "buscarDaPlanilha",
            async () => {
                quantidadeChamadas += 1;

                if (
                    quantidadeChamadas ===
                    1
                ) {
                    return [
                        criarPergunta(),
                    ];
                }

                throw new Error(
                    "Planilha indisponível"
                );
            }
        );

        const primeiraConsulta =
            await perguntaService
                .listarPerguntas();

        process.env
            .PERGUNTAS_CACHE_TTL_MS =
            "1000";

        const segundaConsulta =
            await perguntaService
                .listarPerguntas();

        assert.deepEqual(
            segundaConsulta,
            primeiraConsulta
        );
    }
);

test(
    "ignora linhas incompletas da planilha",
    async () => {
        mock.method(
            perguntaRepository,
            "buscarDaPlanilha",
            async () => [
                criarPergunta(),
                criarPergunta({
                    id: "2",
                    pergunta: "",
                }),
            ]
        );

        const perguntas =
            await perguntaService
                .listarPerguntas();

        assert.equal(
            perguntas.length,
            1
        );
    }
);

test(
    "rejeita IDs duplicados",
    async () => {
        mock.method(
            perguntaRepository,
            "buscarDaPlanilha",
            async () => [
                criarPergunta(),
                criarPergunta({
                    pergunta:
                        "Outra pergunta",
                }),
            ]
        );

        await assert.rejects(
            () =>
                perguntaService
                    .listarPerguntas(),
            /ID duplicado/
        );
    }
);

test(
    "retorna erro quando não existem perguntas válidas",
    async () => {
        mock.method(
            perguntaRepository,
            "buscarDaPlanilha",
            async () => [
                criarPergunta({
                    pergunta: "",
                }),
            ]
        );

        await assert.rejects(
            () =>
                perguntaService
                    .listarPerguntas(),
            /Nenhuma pergunta válida/
        );
    }
);