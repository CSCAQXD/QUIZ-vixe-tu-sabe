require("dotenv").config({ path: require("node:path").resolve(__dirname, "..", ".env") });

const { copyFile, mkdir, open, rename, stat } = require("node:fs/promises");
const path = require("node:path");
const { resolverDatabaseUrl } = require("../config/databaseUrl");

function argumento(nome) {
    const indice = process.argv.indexOf(nome);
    return indice >= 0 ? process.argv[indice + 1] : undefined;
}

function caminhoDoBanco() {
    const url = resolverDatabaseUrl(process.env.DATABASE_URL);
    if (!url.startsWith("file:")) {
        throw new Error("A restauração automática suporta apenas DATABASE_URL do tipo file:.");
    }
    return path.resolve(url.slice("file:".length));
}

async function validarSQLite(arquivo) {
    const handle = await open(arquivo, "r");
    const cabecalho = Buffer.alloc(16);
    try {
        await handle.read(cabecalho, 0, cabecalho.length, 0);
    } finally {
        await handle.close();
    }
    if (cabecalho.toString("utf8") !== "SQLite format 3\u0000") {
        throw new Error("O arquivo informado não é um banco SQLite válido.");
    }
}

async function existe(arquivo) {
    try {
        await stat(arquivo);
        return true;
    } catch (error) {
        if (error.code === "ENOENT") return false;
        throw error;
    }
}

async function main() {
    const origemInformada = argumento("--from");
    if (!origemInformada || !process.argv.includes("--confirm")) {
        throw new Error("Use: npm run restore:database -- --from <backup.db> --confirm");
    }

    const origem = path.resolve(origemInformada);
    const destino = caminhoDoBanco();
    if (origem === destino)
        throw new Error("O backup e o banco de destino não podem ser o mesmo arquivo.");
    await validarSQLite(origem);
    await mkdir(path.dirname(destino), { recursive: true });

    const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z$/, "Z");
    const anterior = `${destino}.pre-restore-${timestamp}`;
    const temporario = `${destino}.restore-${process.pid}.tmp`;
    await copyFile(origem, temporario);

    const tinhaBanco = await existe(destino);
    if (tinhaBanco) await rename(destino, anterior);
    try {
        await rename(temporario, destino);
    } catch (error) {
        if (tinhaBanco && !(await existe(destino))) await rename(anterior, destino);
        throw error;
    }

    console.log(
        JSON.stringify({
            evento: "database_restored",
            arquivo: destino,
            backupAnterior: tinhaBanco ? anterior : null,
        }),
    );
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    });
}

module.exports = { main, validarSQLite };
