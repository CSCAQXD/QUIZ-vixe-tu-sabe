[CmdletBinding()]
param(
    [string]$CsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTsNj_z-lz_htrzuv0pbyFllv_z2cFNeRRvX-GUV2RPUEsx08TfUoSS24LjXZS3OML3O1f_yW-e-E6t/pub?output=csv",

    [ValidateRange(1000, 60000)]
    [int]$TimeoutMs = 10000
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$parsedUrl = $null
if (-not [Uri]::TryCreate($CsvUrl, [UriKind]::Absolute, [ref]$parsedUrl) -or $parsedUrl.Scheme -ne "https") {
    throw "Informe uma URL HTTPS valida para a planilha de perguntas."
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$environmentPath = Join-Path $repositoryRoot ".env"
if (-not (Test-Path -LiteralPath $environmentPath)) {
    throw "O arquivo .env nao existe. Execute configurar-deploy-interno.ps1 primeiro."
}

$settings = [ordered]@{
    PERGUNTAS_CSV_URL = $parsedUrl.AbsoluteUri
    PERGUNTAS_TIMEOUT_MS = [string]$TimeoutMs
}

$lines = @(Get-Content -LiteralPath $environmentPath)
foreach ($name in $settings.Keys) {
    $replacement = "${name}=$($settings[$name])"
    $matchingIndex = -1

    for ($index = 0; $index -lt $lines.Count; $index++) {
        if ($lines[$index] -match "^$([regex]::Escape($name))=") {
            $matchingIndex = $index
            break
        }
    }

    if ($matchingIndex -ge 0) {
        $lines[$matchingIndex] = $replacement
    }
    else {
        $lines += $replacement
    }
}

Set-Content -LiteralPath $environmentPath -Value $lines -Encoding Ascii

Write-Host "Fonte de perguntas configurada sem alterar os segredos." -ForegroundColor Green
