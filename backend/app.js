const express = require("express");
const cors = require("cors");

const perguntaRouter = require("./routers/pergunta.router");
const escolaRouter = require("./routers/escola.router");
const sessaoRouter = require("./routers/sessao.router");
const rankingRouter = require("./routers/ranking.router");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

const origensPermitidas = (process.env.CORS_ORIGINS || "*")
    .split(",")
    .map((origem) => origem.trim());

app.disable("x-powered-by");

app.use(
    cors({
        origin: origensPermitidas.includes("*")
            ? true
            : origensPermitidas,
    })
);

app.use(express.json({ limit: "100kb" }));

app.get("/health", (req, res) => {
    return res.json({
        status: "ok",
        servico: "Quiz Vixe, Tu Sabe? - API",
    });
});

app.use("/perguntas", perguntaRouter);
app.use("/escolas", escolaRouter);
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