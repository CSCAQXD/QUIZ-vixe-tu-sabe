import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const API_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDirectory, "../shared/municipios.json");

async function fetchJson(url) {
    const response = await fetch(url, {
        headers: { accept: "application/json" },
    });

    if (!response.ok) {
        throw new Error(`IBGE respondeu ${response.status} ao consultar ${url}.`);
    }

    return response.json();
}

const states = await fetchJson(`${API_BASE}/estados?orderBy=nome`);
const municipalityGroups = await Promise.all(
    states.map(async (state) => {
        const municipalities = await fetchJson(
            `${API_BASE}/estados/${state.id}/municipios?orderBy=nome`,
        );

        return municipalities.map((municipality) => ({
            id: String(municipality.id),
            nome: municipality.nome,
            uf: state.sigla,
        }));
    }),
);

const municipalities = municipalityGroups
    .flat()
    .sort((first, second) =>
        first.nome.localeCompare(second.nome, "pt-BR", { sensitivity: "base" }) ||
        first.uf.localeCompare(second.uf),
    );

const uniqueIds = new Set(municipalities.map(({ id }) => id));
const cearaCount = municipalities.filter(({ uf }) => uf === "CE").length;

if (municipalities.length < 5_500 || uniqueIds.size !== municipalities.length) {
    throw new Error("A resposta do IBGE está incompleta ou possui códigos repetidos.");
}

if (cearaCount !== 184) {
    throw new Error(`Esperados 184 municípios do Ceará, mas foram recebidos ${cearaCount}.`);
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(municipalities, null, 2)}\n`, "utf8");

console.log(
    `Catálogo atualizado: ${municipalities.length} municípios, ${cearaCount} do Ceará.`,
);
