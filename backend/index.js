require("dotenv").config();

const express = require("express");
const cors = require("cors");

const perguntasRoutes = require("./src/routes/perguntas.routes");
const escolaRouter = require("./routers/escola.router");
const sessaoRouter = require("./routers/sessao.router");
const rankingRoutes = require("./src/routes/ranking.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        servico: "Quiz Vixe, Tu Sabe? - API",
    });
});

app.use(perguntasRoutes);
app.use("/escolas", escolaRouter);
app.use("/sessao", sessaoRouter);
app.use("/sessoes", sessaoRouter);
app.use(rankingRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(
        `🚀 Servidor da Casa de Saberes rodando em http://localhost:${PORT}`
    );
});