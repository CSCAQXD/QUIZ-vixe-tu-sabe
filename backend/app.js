const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const prisma = require("./config/prisma");
const requestContext = require("./middlewares/requestContext.middleware");

const perguntaRouter = require("./routers/pergunta.router");

const escolaRouter = require("./routers/escola.router");
const cursoRouter = require("./routers/curso.router");

const sessaoRouter = require("./routers/sessao.router");

const rankingRouter = require("./routers/ranking.router");

const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

const trustProxy = Number(process.env.TRUST_PROXY);
if (Number.isInteger(trustProxy) && trustProxy > 0) {
    app.set("trust proxy", trustProxy);
}

function obterOrigensPermitidas() {
    return (process.env.CORS_ORIGINS || "*")
        .split(",")
        .map((origem) => origem.trim())
        .filter(Boolean);
}

function validarOrigem(origem, callback) {
    const origensPermitidas = obterOrigensPermitidas();

    if (!origem || origensPermitidas.includes("*") || origensPermitidas.includes(origem)) {
        return callback(null, true);
    }

    const erro = new Error("Origem não autorizada.");

    erro.statusCode = 403;

    return callback(erro);
}

app.disable("x-powered-by");

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
);

app.use(requestContext);

app.use(
    cors({
        origin: validarOrigem,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type"],
        exposedHeaders: ["X-Request-ID", "RateLimit"],
        maxAge: 86400,
    }),
);

app.use(
    express.json({
        limit: "100kb",
        strict: true,
    }),
);

app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "ok",
        servico: "Quiz Vixe, Tu Sabe? - API",
        horario: new Date().toISOString(),
    });
});

app.get("/ready", async (req, res, next) => {
    try {
        await prisma.$queryRawUnsafe("SELECT 1");
        return res.status(200).json({ status: "ready" });
    } catch (error) {
        error.statusCode = 503;
        return next(error);
    }
});

app.use("/perguntas", perguntaRouter);

app.use("/escolas", escolaRouter);
app.use("/escolas", cursoRouter);

app.use("/sessao", sessaoRouter);

app.use("/sessoes", sessaoRouter);

app.use(rankingRouter);

app.use((req, res) => {
    return res.status(404).json({
        erro: "Rota não encontrada.",
    });
});

app.use(errorMiddleware);

module.exports = app;
