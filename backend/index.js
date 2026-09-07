require("dotenv").config();

const app = require("./app");
const prisma = require("./config/prisma");

const PORT = Number(process.env.PORT) || 3001;

const servidor = app.listen(PORT, () => {
    console.log(
        `Servidor da Casa de Saberes rodando em http://localhost:${PORT}`
    );
});

function encerrarServidor() {
    servidor.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
}

process.on("SIGINT", encerrarServidor);
process.on("SIGTERM", encerrarServidor);