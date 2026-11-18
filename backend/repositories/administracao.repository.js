const prisma = require("../config/prisma");

async function limparSessoesDoAno(ano, cliente = prisma) {
    return cliente.$transaction(async (transacao) => {
        const participacoes = await transacao.participacao.count({
            where: { partida: { ano } },
        });
        const partidas = await transacao.partida.count({ where: { ano } });

        await transacao.participacao.deleteMany({
            where: { partida: { ano } },
        });
        await transacao.partida.deleteMany({ where: { ano } });

        return { partidas, participacoes };
    });
}

module.exports = {
    limparSessoesDoAno,
};
