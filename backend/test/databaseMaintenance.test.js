const test = require("node:test");
const assert = require("node:assert/strict");
const { mkdtemp, readdir, rm } = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const Database = require("better-sqlite3");

test("cria um backup consistente e restaura preservando a base anterior", async () => {
    const temporario = await mkdtemp(path.join(os.tmpdir(), "vixe-backup-"));
    const bancoAtivo = path.join(temporario, "ativo.db");
    const diretorioBackup = path.join(temporario, "backups");
    const databaseUrlAnterior = process.env.DATABASE_URL;
    const argumentosAnteriores = process.argv;
    const logOriginal = console.log;

    try {
        const banco = new Database(bancoAtivo);
        banco.exec("CREATE TABLE estado (valor TEXT NOT NULL)");
        banco.prepare("INSERT INTO estado (valor) VALUES (?)").run("original");
        banco.close();

        process.env.DATABASE_URL = `file:${bancoAtivo.replace(/\\/g, "/")}`;
        console.log = () => {};

        process.argv = [process.execPath, "backupDatabase.js", "--output", diretorioBackup];
        const { main: criarBackup } = require("../scripts/backupDatabase");
        await criarBackup();

        const [nomeBackup] = await readdir(diretorioBackup);
        assert.match(nomeBackup, /^quiz-\d{8}T\d{6}Z\.db$/);
        const arquivoBackup = path.join(diretorioBackup, nomeBackup);

        const alterado = new Database(bancoAtivo);
        alterado.prepare("UPDATE estado SET valor = ?").run("alterado");
        alterado.close();

        process.argv = [
            process.execPath,
            "restoreDatabase.js",
            "--from",
            arquivoBackup,
            "--confirm",
        ];
        const { main: restaurarBackup } = require("../scripts/restoreDatabase");
        await restaurarBackup();

        const restaurado = new Database(bancoAtivo, { readonly: true });
        assert.equal(restaurado.prepare("SELECT valor FROM estado").get().valor, "original");
        restaurado.close();

        const arquivos = await readdir(temporario);
        assert.ok(arquivos.some((nome) => nome.startsWith("ativo.db.pre-restore-")));
    } finally {
        console.log = logOriginal;
        process.argv = argumentosAnteriores;
        if (databaseUrlAnterior === undefined) delete process.env.DATABASE_URL;
        else process.env.DATABASE_URL = databaseUrlAnterior;

        assert.equal(path.dirname(temporario), path.resolve(os.tmpdir()));
        assert.ok(path.basename(temporario).startsWith("vixe-backup-"));
        await rm(temporario, { recursive: true, force: true });
    }
});
