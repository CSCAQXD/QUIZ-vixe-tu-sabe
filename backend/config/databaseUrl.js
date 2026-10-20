const path = require("node:path");

const diretorioDoSchema = path.resolve(__dirname, "..", "prisma");

function resolverDatabaseUrl(databaseUrl = "file:./dev.db") {
    if (!databaseUrl.startsWith("file:")) return databaseUrl;

    const caminho = databaseUrl.slice("file:".length);
    if (!caminho || path.isAbsolute(caminho)) return databaseUrl;

    const caminhoAbsoluto = path.resolve(diretorioDoSchema, caminho).replace(/\\/g, "/");
    return `file:${caminhoAbsoluto}`;
}

module.exports = { resolverDatabaseUrl };
