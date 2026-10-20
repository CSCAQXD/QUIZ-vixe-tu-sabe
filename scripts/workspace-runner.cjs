const { spawn } = require("node:child_process");

const action = process.argv[2];
const requestedTarget = process.argv[3];
const npmCli = process.env.npm_execpath;

const availableActions = {
  dev: ["backend", "frontend"],
  start: ["backend"],
  test: ["backend", "frontend"],
  "test:coverage": ["backend", "frontend"],
  build: ["frontend"],
  lint: ["frontend"],
  check: ["backend"],
};

function showHelp() {
  console.log(`
Atalhos disponíveis:
  npm run dev backend          Inicia a API em modo de desenvolvimento
  npm run dev frontend         Inicia o site em modo de desenvolvimento
  npm run dev:all              Inicia API e site ao mesmo tempo
  npm run test backend         Executa os testes do backend
  npm run test frontend        Executa os testes do frontend
  npm run test:all             Executa todos os testes
  npm run test:coverage backend|frontend
  npm run coverage:all         Executa a cobertura de ambos
  npm run build frontend       Gera a versão de produção do site
  npm run lint frontend        Verifica o código do site
  npm run check:backend        Verifica o backend e o schema do Prisma
  npm run prisma:migrate       Cria/aplica uma migração local
  npm run prisma:studio        Abre o Prisma Studio
  npm run install:all          Instala as dependências dos dois projetos

Também existem os atalhos npm run dev:backend, dev:frontend,
test:backend, test:frontend, build:frontend e lint:frontend.
`);
}

function run(target) {
  if (!npmCli) {
    console.error("Execute este atalho por meio do npm (por exemplo: npm run dev backend).");
    process.exit(1);
  }

  const child = spawn(process.execPath, [npmCli, "--prefix", target, "run", action], {
    stdio: "inherit",
    shell: false,
  });

  child.on("error", (error) => {
    console.error(`Não foi possível executar ${action} no ${target}: ${error.message}`);
  });

  return child;
}

if (action === "help") {
  showHelp();
  process.exit(0);
}

const supportedTargets = availableActions[action];
if (!supportedTargets) {
  console.error(`A ação "${action}" não possui um atalho configurado.`);
  showHelp();
  process.exit(1);
}

const target = requestedTarget || (supportedTargets.length === 1 ? supportedTargets[0] : null);
if (!target) {
  console.error(`Informe o destino: npm run ${action} backend ou npm run ${action} frontend.`);
  process.exit(1);
}

if (target !== "all" && !supportedTargets.includes(target)) {
  console.error(`O destino "${target}" não aceita a ação "${action}".`);
  console.error(`Destinos válidos: ${supportedTargets.join(", ")}${supportedTargets.length > 1 ? ", all" : ""}.`);
  process.exit(1);
}

const targets = target === "all" ? supportedTargets : [target];
const children = targets.map(run);
let exitCode = 0;

for (const child of children) {
  child.on("exit", (code, signal) => {
    if (signal || code !== 0) exitCode = code || 1;
    if (children.every((process) => process.exitCode !== null || process.signalCode !== null)) {
      process.exitCode = exitCode;
    }
  });
}

function stopChildren(signal) {
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
}

process.on("SIGINT", () => stopChildren("SIGINT"));
process.on("SIGTERM", () => stopChildren("SIGTERM"));
