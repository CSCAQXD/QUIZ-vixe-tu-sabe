const fs = require("node:fs/promises");
const path = require("node:path");
const zlib = require("node:zlib");
const { promisify } = require("node:util");

const { chaveEntidade } = require("../utils/sanitize");

const gunzip = promisify(zlib.gunzip);
const CATALOGO_PATH = path.resolve(
    __dirname,
    "../../shared/escolasCatalogo.json.gz"
);

let catalogoPromise;

function criarErroValidacao(mensagem) {
    const erro = new Error(mensagem);
    erro.statusCode = 400;
    return erro;
}

function normalizarRegistro(registro) {
    const [
        codigoInep,
        nome,
        municipioIbgeId,
        cidade,
        uf,
        dependencia,
    ] = registro;

    return {
        codigoInep: String(codigoInep),
        nome,
        nomeBusca: chaveEntidade(nome),
        identidadeBusca: chaveEntidade(nome, true),
        municipioIbgeId: String(municipioIbgeId),
        cidade,
        uf,
        dependencia: dependencia || null,
    };
}

async function carregarCatalogo() {
    if (!catalogoPromise) {
        catalogoPromise = fs.readFile(CATALOGO_PATH)
            .then(gunzip)
            .then((conteudo) => JSON.parse(conteudo.toString("utf8")))
            .then((catalogo) => {
                const porMunicipio = new Map();

                for (const registro of catalogo.escolas ?? []) {
                    const escola = normalizarRegistro(registro);
                    const escolas = porMunicipio.get(escola.municipioIbgeId) ?? [];
                    escolas.push(escola);
                    porMunicipio.set(escola.municipioIbgeId, escolas);
                }

                return {
                    ano: catalogo.ano,
                    fonte: catalogo.fonte,
                    porMunicipio,
                };
            })
            .catch((error) => {
                catalogoPromise = undefined;
                if (error.code === "ENOENT") {
                    const catalogoError = new Error(
                        "O catálogo local de escolas ainda não foi instalado."
                    );
                    catalogoError.statusCode = 503;
                    throw catalogoError;
                }
                throw error;
            });
    }

    return catalogoPromise;
}

function pontuarCorrespondencia(escola, termoBusca) {
    if (escola.nomeBusca === termoBusca) return -1;
    if (escola.nomeBusca.startsWith(termoBusca)) return 0;

    const termos = termoBusca.split(" ").filter(Boolean);
    const palavras = escola.nomeBusca.split(" ").filter(Boolean);
    if (termos.every((termo) => palavras.some((palavra) => palavra.startsWith(termo)))) {
        return 1;
    }
    if (termos.every((termo) => escola.nomeBusca.includes(termo))) return 2;

    return null;
}

function buscarNoCatalogo(escolas, termo, limite) {
    const termoBusca = chaveEntidade(termo);

    return escolas
        .map((escola) => ({
            escola,
            pontuacao: pontuarCorrespondencia(escola, termoBusca),
        }))
        .filter(({ pontuacao }) => pontuacao !== null)
        .sort((primeira, segunda) =>
            primeira.pontuacao - segunda.pontuacao ||
            primeira.escola.nome.localeCompare(
                segunda.escola.nome,
                "pt-BR",
                { sensitivity: "base" }
            ) ||
            primeira.escola.codigoInep.localeCompare(segunda.escola.codigoInep)
        )
        .slice(0, limite)
        .map(({ escola }) => ({
            codigoInep: escola.codigoInep,
            nome: escola.nome,
            municipioIbgeId: escola.municipioIbgeId,
            cidade: escola.cidade,
            uf: escola.uf,
            dependencia: escola.dependencia,
        }));
}

async function buscarEscolas({ municipioIbgeId, termo, limite = 8 }) {
    const municipio = String(municipioIbgeId ?? "").trim();
    const busca = String(termo ?? "").trim();
    const quantidade = Number(limite);

    if (!/^\d{7}$/.test(municipio)) {
        throw criarErroValidacao("Selecione uma cidade válida antes de buscar a escola.");
    }
    if (chaveEntidade(busca).replace(/\s/g, "").length < 2) {
        throw criarErroValidacao("Digite pelo menos 2 caracteres para buscar a escola.");
    }
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 20) {
        throw criarErroValidacao("O limite da busca deve ser um número entre 1 e 20.");
    }

    const catalogo = await carregarCatalogo();
    const escolas = catalogo.porMunicipio.get(municipio) ?? [];

    return {
        ano: catalogo.ano,
        fonte: catalogo.fonte,
        escolas: buscarNoCatalogo(escolas, busca, quantidade),
    };
}

async function buscarCorrespondenciaExata({ municipioIbgeId, nome }) {
    const municipio = String(municipioIbgeId ?? "").trim();
    const identidade = chaveEntidade(nome, true);

    if (!/^\d{7}$/.test(municipio) || identidade.length < 3) return null;

    const catalogo = await carregarCatalogo();
    const correspondencias = (catalogo.porMunicipio.get(municipio) ?? [])
        .filter((escola) => escola.identidadeBusca === identidade);

    return correspondencias.length === 1
        ? correspondencias[0]
        : null;
}

module.exports = {
    buscarCorrespondenciaExata,
    buscarEscolas,
    buscarNoCatalogo,
};
