import { createWriteStream } from "node:fs";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { spawn, spawnSync } from "node:child_process";
import readline from "node:readline";
import { gzipSync } from "node:zlib";

const SOURCE_URL = "https://download.inep.gov.br/dados_abertos/microdados_censo_escolar_2025_.zip";
const OUTPUT_PATH = path.resolve("shared/escolasCatalogo.json.gz");
const SOURCE_YEAR = 2025;

const DEPENDENCIAS = {
    1: "Federal",
    2: "Estadual",
    3: "Municipal",
    4: "Privada",
};

function getArgument(name) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : undefined;
}

function parseDelimitedLine(line) {
    const values = [];
    let current = "";
    let quoted = false;

    for (let index = 0; index < line.length; index += 1) {
        const character = line[index];
        if (character === '"') {
            if (quoted && line[index + 1] === '"') {
                current += '"';
                index += 1;
            } else {
                quoted = !quoted;
            }
        } else if (character === ";" && !quoted) {
            values.push(current);
            current = "";
        } else {
            current += character;
        }
    }

    values.push(current);
    return values;
}

async function downloadZip(destination) {
    const response = await fetch(SOURCE_URL);
    if (!response.ok || !response.body) {
        throw new Error(`Não foi possível baixar o Censo Escolar: HTTP ${response.status}.`);
    }

    await pipeline(response.body, createWriteStream(destination));
}

function findSchoolCsv(zipPath) {
    const result = spawnSync("tar", ["-tf", zipPath], {
        encoding: "utf8",
        maxBuffer: 20 * 1024 * 1024,
    });
    if (result.status !== 0) {
        throw new Error(`Não foi possível ler o ZIP do INEP: ${result.stderr}`);
    }

    const entries = result.stdout.split(/\r?\n/).filter(Boolean);
    const preferred = entries.find((entry) =>
        /(?:^|\/)Tabela_Escola_2025(?:_V2)?\.csv$/i.test(entry),
    );
    const fallback = entries.find((entry) =>
        /\.csv$/i.test(entry) && !/(dicionario|anexo|gestor|docente|matricula|turma)/i.test(entry),
    );
    const selected = preferred ?? fallback;

    if (!selected) {
        throw new Error("O ZIP não contém o arquivo CSV esperado de escolas.");
    }
    return selected;
}

function requiredIndexes(header) {
    const fields = [
        "CO_ENTIDADE",
        "NO_ENTIDADE",
        "CO_MUNICIPIO",
        "NO_MUNICIPIO",
        "SG_UF",
        "TP_DEPENDENCIA",
        "TP_SITUACAO_FUNCIONAMENTO",
    ];
    const indexes = Object.fromEntries(fields.map((field) => [field, header.indexOf(field)]));
    const missing = fields.filter((field) => indexes[field] < 0);

    if (missing.length > 0) {
        throw new Error(`Colunas não encontradas no CSV do INEP: ${missing.join(", ")}.`);
    }
    return indexes;
}

async function extractCatalog(zipPath, entry) {
    const extraction = spawn("tar", ["-xOf", zipPath, entry], {
        stdio: ["ignore", "pipe", "pipe"],
    });
    extraction.stdout.setEncoding(process.env.INEP_CSV_ENCODING ?? "latin1");

    let stderr = "";
    extraction.stderr.setEncoding("utf8");
    extraction.stderr.on("data", (chunk) => { stderr += chunk; });

    const lines = readline.createInterface({
        input: extraction.stdout,
        crlfDelay: Infinity,
    });
    const schools = [];
    let indexes;

    for await (const rawLine of lines) {
        const line = rawLine.replace(/^\uFEFF/, "");
        if (!indexes) {
            indexes = requiredIndexes(parseDelimitedLine(line));
            continue;
        }

        const values = parseDelimitedLine(line);
        if (values[indexes.TP_SITUACAO_FUNCIONAMENTO] !== "1") continue;

        const codigoInep = values[indexes.CO_ENTIDADE]?.trim();
        const nome = values[indexes.NO_ENTIDADE]?.trim().replace(/\s+/g, " ");
        const municipioIbgeId = values[indexes.CO_MUNICIPIO]?.trim();
        const cidade = values[indexes.NO_MUNICIPIO]?.trim().replace(/\s+/g, " ");
        const uf = values[indexes.SG_UF]?.trim().toUpperCase();
        const dependencia = DEPENDENCIAS[values[indexes.TP_DEPENDENCIA]?.trim()] ?? null;

        if (!/^\d{8}$/.test(codigoInep) || !/^\d{7}$/.test(municipioIbgeId) || !nome || !cidade || !uf) {
            continue;
        }

        schools.push([
            codigoInep,
            nome,
            municipioIbgeId,
            cidade,
            uf,
            dependencia,
        ]);
    }

    const exitCode = await new Promise((resolve, reject) => {
        extraction.once("error", reject);
        extraction.once("close", resolve);
    });
    if (exitCode !== 0) {
        throw new Error(`Falha ao extrair o CSV do INEP: ${stderr}`);
    }

    schools.sort((first, second) =>
        first[2].localeCompare(second[2]) ||
        first[1].localeCompare(second[1], "pt-BR", { sensitivity: "base" }) ||
        first[0].localeCompare(second[0]),
    );

    return schools;
}

async function main() {
    const suppliedZip = getArgument("--zip") ?? process.env.INEP_CENSO_ZIP;
    const outputPath = path.resolve(getArgument("--output") ?? OUTPUT_PATH);
    const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "vixe-escolas-"));
    const zipPath = suppliedZip
        ? path.resolve(suppliedZip)
        : path.join(temporaryDirectory, "microdados-censo-escolar-2025.zip");

    try {
        if (!suppliedZip) {
            console.log("Baixando os microdados oficiais do Censo Escolar 2025...");
            await downloadZip(zipPath);
        } else {
            await readFile(zipPath, { flag: "r" });
        }

        const csvEntry = findSchoolCsv(zipPath);
        console.log(`Extraindo ${csvEntry}...`);
        const schools = await extractCatalog(zipPath, csvEntry);
        const catalog = {
            ano: SOURCE_YEAR,
            fonte: "Censo Escolar/INEP",
            somenteAtivas: true,
            escolas: schools,
        };

        await mkdir(path.dirname(outputPath), { recursive: true });
        await writeFile(
            outputPath,
            gzipSync(JSON.stringify(catalog), { level: 9 }),
        );
        console.log(`${schools.length} escolas ativas gravadas em ${outputPath}.`);
    } finally {
        await rm(temporaryDirectory, { recursive: true, force: true });
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
