import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'
import { resolverDatabaseUrl } from './config/databaseUrl.js'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: resolverDatabaseUrl(env('DATABASE_URL')),
  },
})
