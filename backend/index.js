require("dotenv").config();

const app = require("./app");
const prisma = require("./config/prisma");
const logger = require("./utils/logger");

const PORT = Number(process.env.PORT) || 3001;

const servidor = app.listen(PORT, () => {
    logger.info("server_started", { porta: PORT, ambiente: process.env.NODE_ENV || "development" });
});

let encerrando = false;

async function encerrarServidor(sinal) {
    if (encerrando) {
        return;
    }

    encerrando = true;

    logger.info("server_shutdown_started", { sinal });

    servidor.close(async (error) => {
        try {
            await prisma.$disconnect();

            if (error) {
                logger.error("server_shutdown_error", {
                    mensagem: error.message,
                    stack: error.stack,
                });
                process.exitCode = 1;
            }
        } catch (erroPrisma) {
            logger.error("database_disconnect_error", {
                mensagem: erroPrisma.message,
                stack: erroPrisma.stack,
            });

            process.exitCode = 1;
        }
    });
}

process.on("SIGINT", () => {
    encerrarServidor("SIGINT");
});

process.on("SIGTERM", () => {
    encerrarServidor("SIGTERM");
});
