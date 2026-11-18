# Servidor Windows na rede interna

Este guia é específico para o computador Windows 11 Pro usado como servidor local da Casa de Saberes Cego Aderaldo. O sistema deve ser acessível apenas pelos notebooks autorizados na mesma rede.

## Requisitos

- Windows 11 Pro atualizado;
- virtualização habilitada no firmware;
- WSL 2;
- Docker Desktop configurado para contêineres Linux;
- Git;
- rede marcada como **Privada**;
- endereço IPv4 reservado no DHCP do roteador;
- usuário Windows protegido por senha e sem compartilhamento administrativo.

Não use o computador das câmeras de segurança como servidor. Não publique as portas do quiz na internet.

## Verificar a máquina

Em PowerShell:

```powershell
wsl --status
git --version
docker --version
docker compose version
docker info
Get-NetConnectionProfile
ipconfig
```

O WSL deve usar a versão padrão 2, o Docker deve exibir as seções `Client` e `Server`, e a conexão utilizada deve estar como `Private`.

Para ajustar o perfil da rede, em PowerShell como administrador:

```powershell
Set-NetConnectionProfile -InterfaceAlias "Wi-Fi 2" -NetworkCategory Private
```

Adapte o nome da interface conforme `Get-NetAdapter`.

## Instalação inicial

```powershell
Set-Location C:\
git clone --branch main --single-branch https://github.com/CSCAQXD/QUIZ-vixe-tu-sabe.git VixeTuSabe
Set-Location C:\VixeTuSabe
powershell -ExecutionPolicy Bypass -File .\scripts\configurar-deploy-interno.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\definir-senha-administracao.ps1
docker compose config --quiet
docker compose up --build -d
```

O script de configuração cria `.env` com segredos aleatórios e a pasta `backups`. Ele recusa sobrescrever uma configuração existente.

## Endereço curto e firewall

Reserve o IPv4 do servidor no roteador usando o endereço MAC da interface ativa. Depois configure a aplicação na porta 80:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\configurar-url-interna.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\liberar-firewall-rede-interna.ps1 -Port 80
docker compose up -d
```

A regra de firewall aceita a porta somente no perfil privado e para `LocalSubnet`.

Para configurar `http://vixetusabe` em um notebook autorizado, copie apenas o script de cliente e execute como administrador:

```powershell
powershell -ExecutionPolicy Bypass -File .\configurar-cliente-rede-interna.ps1 -ServerAddress 192.168.0.6
```

Substitua o IPv4 pelo endereço reservado. O script altera o arquivo `hosts` daquele notebook. Se a equipe preferir não configurar cada máquina, use o nome do servidor, como `http://DESKTOP-ETEACEU`, desde que a rede resolva esse nome corretamente.

## Inicialização automática

Os serviços `backend` e `frontend` usam `restart: unless-stopped`, mas dependem do Docker Desktop estar ativo.

1. Abra Docker Desktop.
2. Acesse **Settings > General**.
3. Ative **Start Docker Desktop when you sign in to your computer**.
4. Aplique e reinicie o computador.
5. Entre no usuário Windows usado pelo servidor.
6. Aguarde o Docker ficar em estado `running`.
7. Teste `http://localhost/health` e `http://vixetusabe/health`.

Com Docker Desktop, os contêineres iniciam depois que o usuário entra no Windows. Eles não ficam disponíveis antes do login. Se o servidor precisar funcionar sem login interativo, use um host Linux ou uma solução de Docker executada como serviço; não tente contornar isso armazenando senha do Windows em scripts.

## Trocar a senha administrativa

```powershell
Set-Location C:\VixeTuSabe
powershell -ExecutionPolicy Bypass -File .\scripts\definir-senha-administracao.ps1
docker compose up -d --force-recreate backend
```

Use uma senha exclusiva de 16 a 128 caracteres. O script aceita letras, números e os símbolos `! @ % _ . -`. Se uma senha aparecer em chat, captura de tela, issue ou commit, considere-a comprometida e troque-a.

## Atualizar o sistema

Faça a atualização somente depois do merge e com backup confirmado:

```powershell
Set-Location C:\VixeTuSabe
docker compose exec -T backend node scripts/backupDatabase.js
git status --short
git fetch origin
git switch main
git pull --ff-only origin main
docker compose up --build -d
docker compose ps
Invoke-WebRequest http://localhost/health -UseBasicParsing
Invoke-RestMethod http://localhost/api/ready
```

O `.env`, a pasta `backups` e o volume Docker não devem ser substituídos. Se `git status` mostrar alterações em arquivos versionados, pare e investigue antes de atualizar.

## Parar e iniciar manualmente

```powershell
docker desktop start
Set-Location C:\VixeTuSabe
docker compose up -d
```

Para parar temporariamente:

```powershell
Set-Location C:\VixeTuSabe
docker compose stop
```

Não use `docker compose down -v`: a opção `-v` remove o volume que contém banco, perguntas e rankings.

## Diagnóstico rápido

### O endereço não abre após ligar a máquina

```powershell
docker desktop status
docker desktop start
Set-Location C:\VixeTuSabe
docker compose up -d
docker compose ps
```

### O frontend abre, mas o quiz falha

```powershell
Invoke-WebRequest http://localhost/health -UseBasicParsing
Invoke-RestMethod http://localhost/api/ready
docker compose logs --tail 100 backend
docker compose logs --tail 100 frontend
```

### O nome curto não funciona no cliente

```powershell
Clear-DnsClientCache
Invoke-WebRequest http://DESKTOP-ETEACEU/health -UseBasicParsing
Invoke-WebRequest http://192.168.0.6/health -UseBasicParsing
```

Se o IPv4 funcionar e o nome não, o problema é de resolução de nomes. Reconfigure o cliente ou use o nome do servidor.

### Após queda de energia

1. ligue o servidor;
2. entre no Windows;
3. aguarde Docker Desktop;
4. confirme `docker compose ps`;
5. teste `/health` e `/api/ready`;
6. verifique a última partida antes de retomar o atendimento.

## Rotina recomendada

- Diariamente: conferir se o endereço abre e se os contêineres estão saudáveis.
- Antes de atualizações: criar backup e verificar espaço em disco.
- Semanalmente: copiar `C:\VixeTuSabe\backups` para mídia externa criptografada.
- Mensalmente: aplicar atualizações do Windows, Docker e dependências aprovadas.
- Trimestralmente: testar uma restauração em ambiente isolado.
- Anualmente: exportar rankings, validar o arquivo e só então reiniciar o ano.
