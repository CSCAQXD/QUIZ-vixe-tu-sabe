require("dotenv").config({ path: require("node:path").resolve(__dirname, "..", ".env") });

const { createHash } = require("node:crypto");
const { mkdir, readFile, readdir, stat, unlink } = require("node:fs/promises");
const path = require("node:path");
const Database = require("better-sqlite3");
const { resolverDatabaseUrl } = require("../config/databaseUrl");

function argumento(nome) {
    const indice = process.argv.indexOf(nome);
    return indice >= 0 ? process.argv[indice + 1] : undefined;
}

function caminhoDoBanco() {
    const url = resolverDatabaseUrl(process.env.DATABASE_URL);
    if (!url.startsWith("file:")) {
        throw new Error("O backup automático suporta apenas DATABASE_URL do tipo file:.");
    }
    return path.resolve(url.slice("file:".length));
}

async function removerBackupsExpirados(diretorio, retencaoDias) {
    const limite = Date.now() - retencaoDias * 86_400_000;
    const arquivos = await readdir(diretorio, { withFileTypes: true });

    await Promise.all(
        arquivos
            .filter((item) => item.isFile() && /^quiz-\d{8}T\d{6}Z\.db$/.test(item.name))
            .map(async (item) => {
                const arquivo = path.join(diretorio, item.name);
                if ((await stat(arquivo)).mtimeMs < limite) await unlink(arquivo);
            }),
    );
}

async function main() {
    const origem = caminhoDoBanco();
    const diretorio = path.resolve(
        argumento("--output") ||
            process.env.BACKUP_DIRECTORY ||
            path.join(__dirname, "..", "backups"),
    );
    const retencaoDias = Math.max(1, Number(process.env.BACKUP_RETENTION_DAYS) || 30);
    const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z$/, "Z");
    const destino = path.join(diretorio, `quiz-${timestamp}.db`);

    await mkdir(diretorio, { recursive: true });
    const banco = new Database(origem, { fileMustExist: true, readonly: true });
    try {
        await banco.backup(destino);
    } finally {
        banco.close();
    }

    const hash = createHash("sha256")
        .update(await readFile(destino))
        .digest("hex");
    await removerBackupsExpirados(diretorio, retencaoDias);
    console.log(
        JSON.stringify({ evento: "database_backup_created", arquivo: destino, sha256: hash }),
    );
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    });
}

module.exports = { main, removerBackupsExpirados };
