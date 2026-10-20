const prisma = require(
    "../config/prisma"
);
const { chaveEntidade } = require("../utils/sanitize");

async function buscarTodas() {
    return prisma.escola.findMany({
        orderBy: [
            {
                nome: "asc",
            },
            {
                cidade: "asc",
            },
        ],
    });
}

async function buscarPorId(id) {
    return prisma.escola.findUnique({
        where: {
            id,
        },
    });
}

async function buscarPorNomeECidade(
    nome,
    cidade,
    cliente = prisma
) {
    return cliente.escola.findUnique({
        where: {
            nome_cidade: {
                nome,
                cidade,
            },
        },
    });
}

async function buscarOuCriar(
    nome,
    cidade,
    nomeBusca,
    cidadeBusca,
    cidadeUf,
    municipioIbgeId,
    codigoInep,
    cliente = prisma
) {
    let assinaturaLegada = false;
    if (cidadeUf && typeof cidadeUf === "object" && cidadeUf.escola) {
        cliente = cidadeUf;
        cidadeUf = "";
        municipioIbgeId = "";
        codigoInep = "";
        assinaturaLegada = true;
    }

    codigoInep = String(codigoInep ?? "").trim();
    const officialIdentity = municipioIbgeId
        ? { nomeBusca, municipioIbgeId }
        : null;
    let existente = codigoInep && typeof cliente.escola.findUnique === "function"
        ? await cliente.escola.findUnique({ where: { codigoInep } })
        : null;

    if (!existente) {
        existente = await cliente.escola.findFirst({
            where: {
                ...(codigoInep ? { codigoInep: null } : {}),
                OR: [
                    ...(officialIdentity ? [officialIdentity] : []),
                    { nomeBusca, cidadeBusca },
                    { nome, cidade },
                ],
            },
        });
    }

    if (existente) {
        const possuiChaves =
            Object.hasOwn(existente, "nomeBusca") &&
            Object.hasOwn(existente, "cidadeBusca");

        const dadosMunicipio = {
            cidade,
            cidadeBusca,
            cidadeUf: cidadeUf || null,
            municipioIbgeId: municipioIbgeId || null,
            nomeBusca,
            ...(codigoInep ? { codigoInep, nome } : {}),
        };

        if (
            (!possuiChaves && assinaturaLegada) ||
            (
                possuiChaves &&
                existente.nomeBusca === nomeBusca &&
                existente.cidadeBusca === cidadeBusca &&
                (!municipioIbgeId || existente.municipioIbgeId === municipioIbgeId) &&
                (!codigoInep || existente.codigoInep === codigoInep)
            )
        ) {
            return existente;
        }

        try {
            return await cliente.escola.update({
                where: { id: existente.id },
                data: dadosMunicipio,
            });
        } catch (error) {
            if (error.code !== "P2002") throw error;

            return cliente.escola.findFirst({
                where: { nomeBusca, cidadeBusca },
            });
        }
    }

    const legadas = await cliente.escola.findMany({
        where: { nomeBusca: null },
    });
    const legada = legadas.find((escola) =>
        chaveEntidade(escola.nome, true) === nomeBusca &&
        chaveEntidade(escola.cidade) === cidadeBusca
    );

    if (legada) {
        try {
            return await cliente.escola.update({
                where: { id: legada.id },
                data: assinaturaLegada
                    ? { nomeBusca, cidadeBusca }
                    : {
                        cidade,
                        cidadeBusca,
                        cidadeUf: cidadeUf || null,
                        codigoInep: codigoInep || null,
                        municipioIbgeId: municipioIbgeId || null,
                        nomeBusca,
                    },
            });
        } catch (error) {
            if (error.code !== "P2002") throw error;

            return cliente.escola.findFirst({
                where: { nomeBusca, cidadeBusca },
            });
        }
    }

    const data = {
        nome,
        cidade,
        cidadeUf: cidadeUf || null,
        codigoInep: codigoInep || null,
        municipioIbgeId: municipioIbgeId || null,
        nomeBusca,
        cidadeBusca,
    };

    if (typeof cliente.escola.upsert !== "function") {
        return cliente.escola.create({ data });
    }

    const uniqueWhere = codigoInep
        ? { codigoInep }
        : municipioIbgeId
        ? {
            nomeBusca_municipioIbgeId: {
                nomeBusca,
                municipioIbgeId,
            },
        }
        : {
            nomeBusca_cidadeBusca: {
                nomeBusca,
                cidadeBusca,
            },
        };

    return cliente.escola.upsert({
        where: {
            ...uniqueWhere,
        },
        update: {},
        create: data,
    });
}

module.exports = {
    buscarTodas,
    buscarPorId,
    buscarPorNomeECidade,
    buscarOuCriar,
};
