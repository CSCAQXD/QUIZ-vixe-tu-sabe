require("dotenv").config();

const app = require("./app");
const prisma = require(
    "./config/prisma"
);

const PORT =
    Number(process.env.PORT) ||
    3001;

const servidor = app.listen(
    PORT,
    () => {
        console.log(
            `Servidor da Casa de Saberes rodando em http://localhost:${PORT}`
        );
    }
);

let encerrando = false;

async function encerrarServidor(
    sinal
) {
    if (encerrando) {
        return;
    }

    encerrando = true;

    console.log(
        `Encerrando servidor após ${sinal}.`
    );

    servidor.close(async (error) => {
        try {
            await prisma.$disconnect();

            if (error) {
                console.error(error);
                process.exitCode = 1;
            }
        } catch (erroPrisma) {
            console.error(
                erroPrisma
            );

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