[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$ruleName = "Vixe Tu Sabe - Rede interna"
$privateProfiles = Get-NetConnectionProfile | Where-Object NetworkCategory -eq "Private"

if (-not $privateProfiles) {
    throw "Nenhuma conexao de rede privada foi encontrada. Nao foi criada regra de firewall."
}

$existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existingRule) {
    Write-Host "A regra de firewall ja existe e nao foi duplicada." -ForegroundColor Yellow
    exit 0
}

New-NetFirewallRule `
    -DisplayName $ruleName `
    -Direction Inbound `
    -Action Allow `
    -Protocol TCP `
    -LocalPort 8080 `
    -Profile Private `
    -RemoteAddress LocalSubnet | Out-Null

Write-Host "Porta 8080 liberada somente para a sub-rede local em perfil privado." -ForegroundColor Green
