[CmdletBinding()]
param(
    [string]$ServerName = $env:COMPUTERNAME
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function New-HexSecret {
    $bytes = New-Object byte[] 32
    $generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $generator.GetBytes($bytes)
    }
    finally {
        $generator.Dispose()
    }

    return [System.BitConverter]::ToString($bytes).Replace("-", "").ToLowerInvariant()
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$environmentPath = Join-Path $repositoryRoot ".env"
$backupPath = Join-Path $repositoryRoot "backups"

if (Test-Path -LiteralPath $environmentPath) {
    throw "O arquivo .env ja existe. Ele nao foi sobrescrito para preservar os segredos atuais."
}

$normalizedServerName = $ServerName.Trim().ToLowerInvariant()
if (-not $normalizedServerName -or $normalizedServerName -notmatch "^[a-z0-9-]+$") {
    throw "Informe um nome de servidor valido, contendo apenas letras, numeros e hifens."
}

$content = @(
    "SERVER_BIND_ADDRESS=0.0.0.0"
    "CORS_ORIGINS=http://${normalizedServerName}:8080"
    "QUIZ_CONTEXT_SECRET=$(New-HexSecret)"
    "PERGUNTAS_ADMIN_TOKEN=$(New-HexSecret)"
    "BACKUP_RETENTION_DAYS=30"
)

Set-Content -LiteralPath $environmentPath -Value $content -Encoding Ascii
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

Write-Host "Configuracao criada sem exibir os segredos." -ForegroundColor Green
Write-Host "Acesso interno previsto: http://${normalizedServerName}:8080"
Write-Host "Proteja o arquivo .env e inclua a pasta backups na rotina de copia externa."
