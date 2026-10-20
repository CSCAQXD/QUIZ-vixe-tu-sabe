const { execFileSync } = require("node:child_process");
const { mkdtemp, open, rm } = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { once } = require("node:events");

async function iniciarCenario() {
    const temporario = await mkdtemp(path.join(os.tmpdir(), "vixe-categoria-"));
    const anterior = process.env.DATABASE_URL;
    process.env.DATABASE_URL = `file:${path.join(temporario, "integracao.db").replace(/\\/g, "/")}`;
    let prisma;
    let servidor;
    async function encerrar() {
        if (servidor) {
            const fechado = new Promise((resolve, reject) =>
                servidor.close((erro) => (erro ? reject(erro) : resolve())),
            );
            servidor.closeAllConnections?.();
            await fechado;
        }
        if (prisma) await prisma.$disconnect();
        if (anterior === undefined) delete process.env.DATABASE_URL;
        else process.env.DATABASE_URL = anterior;
        if (
            path.dirname(temporario) !== path.resolve(os.tmpdir()) ||
            !path.basename(temporario).startsWith("vixe-categoria-")
        ) {
            throw new Error("Diretório temporário fora do escopo do teste.");
        }
        await rm(temporario, { recursive: true, force: true });
    }
    try {
        const arquivo = await open(path.join(temporario, "integracao.db"), "a");
        await arquivo.close();
        execFileSync(
            process.execPath,
            [require.resolve("prisma/build/index.js"), "migrate", "deploy"],
            {
                cwd: path.resolve(__dirname, ".."),
                env: process.env,
                stdio: "pipe",
                timeout: 60000,
            },
        );
        prisma = require("../config/prisma");
        servidor = require("../app").listen(0, "127.0.0.1");
        await once(servidor, "listening");
        const origem = `http://127.0.0.1:${servidor.address().port}`;
        const consultar = async (rota, dados) => {
            let resposta;
            try {
                resposta = await fetch(
                    `${origem}${rota}`,
                    dados === undefined
                        ? {}
                        : {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(dados),
                          },
                );
            } catch (erro) {
                if (erro.cause?.message) erro.message += `: ${erro.cause.message}`;
                throw erro;
            }
            return { status: resposta.status, dados: await resposta.json() };
        };
        return { prisma, consultar, encerrar };
    } catch (erro) {
        await encerrar();
        if (erro.stdout) erro.message += `\n${erro.stdout}`;
        throw erro;
    }
}

function pergunta(id, faixa) {
    return {
        id,
        tema: "História & Vida",
        faixa,
        pergunta: `Pergunta ${id}?`,
        altA: "A",
        altB: "B",
        altC: "C",
        altD: "D",
        correta: "A",
        pontosIniciais: 100,
    };
}

module.exports = { iniciarCenario, pergunta };
