[CmdletBinding()]
param(
    [string]$AliasName = "vixetusabe",

    [ValidateRange(1, 65535)]
    [int]$Port = 80
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$normalizedAlias = $AliasName.Trim().ToLowerInvariant()
if (-not $normalizedAlias -or $normalizedAlias -notmatch "^[a-z0-9-]+$") {
    throw "Informe um apelido valido, contendo apenas letras, numeros e hifens."
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$environmentPath = Join-Path $repositoryRoot ".env"
if (-not (Test-Path -LiteralPath $environmentPath)) {
    throw "O arquivo .env nao existe. Execute configurar-deploy-interno.ps1 primeiro."
}

$origin = if ($Port -eq 80) { "http://${normalizedAlias}" } else { "http://${normalizedAlias}:${Port}" }
$settings = [ordered]@{
    SERVER_PORT = [string]$Port
    CORS_ORIGINS = $origin
}

$lines = @(Get-Content -LiteralPath $environmentPath)
foreach ($name in $settings.Keys) {
    $replacement = "${name}=$($settings[$name])"
    $matchingIndexes = @(
        for ($index = 0; $index -lt $lines.Count; $index++) {
            if ($lines[$index] -match "^$([regex]::Escape($name))=") {
                $index
            }
        }
    )

    if ($matchingIndexes.Count -gt 0) {
        $lines[$matchingIndexes[0]] = $replacement
    }
    else {
        $lines += $replacement
    }
}

Set-Content -LiteralPath $environmentPath -Value $lines -Encoding Ascii

Write-Host "Endereco interno configurado sem exibir os segredos." -ForegroundColor Green
Write-Host "Acesso previsto: $origin"
Write-Host "Configure o apelido nos notebooks autorizados com configurar-cliente-rede-interna.ps1."
