const { spawnSync } = require('node:child_process')
const path = require('node:path')

const npmCli = process.env.npm_execpath

if (!npmCli) {
  console.error('Execute este instalador por meio de npm run install:all.')
  process.exit(1)
}

const tasks = [
  { project: 'backend', args: ['install'] },
  { project: 'backend', args: ['run', 'prisma:generate'] },
  { project: 'frontend', args: ['install'] },
]

for (const { project, args } of tasks) {
  const projectDirectory = path.resolve(__dirname, '..', project)
  const result = spawnSync(process.execPath, [npmCli, ...args], {
    cwd: projectDirectory,
    env: {
      ...process.env,
      INIT_CWD: projectDirectory,
    },
    stdio: 'inherit',
    shell: false,
  })

  if (result.error) {
    console.error(
      `Não foi possível instalar as dependências de ${project}: ${result.error.message}`,
    )
    process.exit(1)
  }

  if (result.status !== 0) process.exit(result.status ?? 1)
}
