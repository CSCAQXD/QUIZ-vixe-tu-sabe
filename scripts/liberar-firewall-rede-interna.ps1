[CmdletBinding()]
param(
    [ValidateRange(1, 65535)]
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$ruleName = "Vixe Tu Sabe - Rede interna"
$privateProfiles = Get-NetConnectionProfile | Where-Object NetworkCategory -eq "Private"

if (-not $privateProfiles) {
    throw "Nenhuma conexao de rede privada foi encontrada. Nao foi criada regra de firewall."
}

$existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existingRule) {
    $existingRule | Set-NetFirewallRule -Direction Inbound -Action Allow -Profile Private
    $existingRule | Get-NetFirewallPortFilter | Set-NetFirewallPortFilter -Protocol TCP -LocalPort $Port
    $existingRule | Get-NetFirewallAddressFilter | Set-NetFirewallAddressFilter -RemoteAddress LocalSubnet
}
else {
    New-NetFirewallRule `
        -DisplayName $ruleName `
        -Direction Inbound `
        -Action Allow `
        -Protocol TCP `
        -LocalPort $Port `
        -Profile Private `
        -RemoteAddress LocalSubnet | Out-Null
}

Write-Host "Porta $Port liberada somente para a sub-rede local em perfil privado." -ForegroundColor Green
