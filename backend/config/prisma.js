const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const { resolverDatabaseUrl } = require("./databaseUrl");

const adapter = new PrismaBetterSqlite3({
    url: resolverDatabaseUrl(process.env.DATABASE_URL),
});

const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

module.exports = prisma;
