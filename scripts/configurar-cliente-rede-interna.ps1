[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ServerAddress,

    [string]$AliasName = "vixetusabe"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$isAdministrator = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
)
if (-not $isAdministrator) {
    throw "Execute este script em um PowerShell aberto como administrador."
}

$parsedAddress = $null
if (-not [Net.IPAddress]::TryParse($ServerAddress, [ref]$parsedAddress)) {
    throw "Informe um endereco IP valido para o servidor."
}

$normalizedAlias = $AliasName.Trim().ToLowerInvariant()
if (-not $normalizedAlias -or $normalizedAlias -notmatch "^[a-z0-9-]+$") {
    throw "Informe um apelido valido, contendo apenas letras, numeros e hifens."
}

$hostsPath = Join-Path $env:SystemRoot "System32\drivers\etc\hosts"
$marker = "# Vixe Tu Sabe"
$escapedAlias = [regex]::Escape($normalizedAlias)
$preservedLines = @(
    Get-Content -LiteralPath $hostsPath | Where-Object {
        $_ -notmatch "\s${escapedAlias}(?:\s|$)" -and $_ -notmatch "$([regex]::Escape($marker))$"
    }
)
$preservedLines += "$parsedAddress`t$normalizedAlias $marker"

Set-Content -LiteralPath $hostsPath -Value $preservedLines -Encoding Ascii
Clear-DnsClientCache

Write-Host "Acesso configurado neste notebook: http://${normalizedAlias}" -ForegroundColor Green
