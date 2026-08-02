require('dotenv').config();
const express = require('express');
const cors = require('cors');

const perguntasRoutes = require('./src/routes/perguntas.routes');
const escolasRoutes = require('./src/routes/escolas.routes');
const sessoesRoutes = require('./src/routes/sessoes.routes');
const rankingRoutes = require('./src/routes/ranking.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', servico: 'Quiz Vixe, Tu Sabe? - API' });
});

app.use(perguntasRoutes);
app.use(escolasRoutes);
app.use(sessoesRoutes);
app.use(rankingRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor da Casa de Saberes rodando em http://localhost:${PORT}`);
});