const { createHmac, randomBytes, timingSafeEqual } = require("node:crypto");
const { obterMenorFaixa } = require("./faixaEnsino");

const DURACAO_MS = 4 * 60 * 60 * 1000;
const LIMITE_CONTEXTO_QUIZ = 8192;
const segredoLocal = randomBytes(32).toString("hex");
const CATEGORIAS = ["FUNDAMENTAL_1", "FUNDAMENTAL_2", "MEDIO"];

function erroContexto() {
    const erro = new Error(
        "Este quiz não pode ser registrado. Inicie uma nova mediação para continuar.",
    );
    erro.statusCode = 400;
    return erro;
}

function normalizarTurmas(turmas) {
    if (!Array.isArray(turmas) || !turmas.length || turmas.length > 100) {
        throw erroContexto();
    }
    return turmas.map((turma) => {
        const etapaEnsino = turma?.etapaEnsino;
        const serie = turma?.serie;
        const limite = etapaEnsino === "MEDIO" ? 3 : 9;
        if (
            !["FUNDAMENTAL", "MEDIO"].includes(etapaEnsino) ||
            !Number.isInteger(serie) ||
            serie < 1 ||
            serie > limite
        ) {
            throw erroContexto();
        }
        return { etapaEnsino, serie };
    });
}

function assinar(conteudo) {
    const segredo = process.env.QUIZ_CONTEXT_SECRET || segredoLocal;
    return createHmac("sha256", segredo).update(conteudo).digest();
}

function criarContextoQuiz(turmas) {
    const participantes = normalizarTurmas(turmas);
    const categoriaQuiz = obterMenorFaixa(participantes);
    const conteudo = Buffer.from(
        JSON.stringify({
            versao: 1,
            categoriaQuiz,
            turmas: participantes,
            expiraEm: Date.now() + DURACAO_MS,
        }),
    ).toString("base64url");
    return {
        categoriaQuiz,
        contextoQuiz: `${conteudo}.${assinar(conteudo).toString("base64url")}`,
    };
}

function validarContextoQuiz(token, turmasLocais) {
    if (typeof token !== "string" || token.length > LIMITE_CONTEXTO_QUIZ) throw erroContexto();
    const partes = token.split(".");
    if (partes.length !== 2 || partes.some((parte) => !/^[\w-]+$/.test(parte))) {
        throw erroContexto();
    }
    const [conteudo, assinatura] = partes;
    const recebida = Buffer.from(assinatura, "base64url");
    const esperada = assinar(conteudo);
    if (recebida.length !== esperada.length || !timingSafeEqual(recebida, esperada)) {
        throw erroContexto();
    }
    let contexto;
    try {
        contexto = JSON.parse(Buffer.from(conteudo, "base64url").toString("utf8"));
    } catch {
        throw erroContexto();
    }
    if (
        !contexto ||
        contexto.versao !== 1 ||
        !Number.isInteger(contexto.expiraEm) ||
        contexto.expiraEm <= Date.now() ||
        !CATEGORIAS.includes(contexto.categoriaQuiz)
    )
        throw erroContexto();
    const participantes = normalizarTurmas(contexto.turmas);
    if (obterMenorFaixa(participantes) !== contexto.categoriaQuiz) throw erroContexto();

    const disponiveis = new Map();
    for (const turma of participantes) {
        const chave = `${turma.etapaEnsino}:${turma.serie}`;
        disponiveis.set(chave, (disponiveis.get(chave) || 0) + 1);
    }
    for (const turma of normalizarTurmas(turmasLocais)) {
        const chave = `${turma.etapaEnsino}:${turma.serie}`;
        const quantidade = disponiveis.get(chave) || 0;
        if (!quantidade) throw erroContexto();
        disponiveis.set(chave, quantidade - 1);
    }
    return contexto.categoriaQuiz;
}

module.exports = { criarContextoQuiz, validarContextoQuiz, LIMITE_CONTEXTO_QUIZ };
