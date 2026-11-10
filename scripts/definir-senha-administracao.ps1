[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function ConvertFrom-SecureValue {
    param([Security.SecureString]$SecureValue)

    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureValue)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$environmentPath = Join-Path $repositoryRoot ".env"
if (-not (Test-Path -LiteralPath $environmentPath)) {
    throw "O arquivo .env nao existe. Execute configurar-deploy-interno.ps1 primeiro."
}

$password = ConvertFrom-SecureValue (Read-Host "Nova senha administrativa" -AsSecureString)
$confirmation = ConvertFrom-SecureValue (Read-Host "Confirme a senha administrativa" -AsSecureString)

try {
    if ($password -ne $confirmation) {
        throw "As senhas informadas nao coincidem."
    }

    if ($password.Length -lt 16 -or $password.Length -gt 128) {
        throw "A senha deve possuir entre 16 e 128 caracteres."
    }

    if ($password -notmatch "^[A-Za-z0-9!@%_.-]+$") {
        throw "Use apenas letras, numeros e os simbolos ! @ % _ . -"
    }

    $lines = @(Get-Content -LiteralPath $environmentPath)
    $replacement = "PERGUNTAS_ADMIN_TOKEN=$password"
    $matchingIndex = -1

    for ($index = 0; $index -lt $lines.Count; $index++) {
        if ($lines[$index] -match "^PERGUNTAS_ADMIN_TOKEN=") {
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

    Set-Content -LiteralPath $environmentPath -Value $lines -Encoding Ascii
}
finally {
    $password = $null
    $confirmation = $null
}

Write-Host "Senha administrativa atualizada sem exibir o valor." -ForegroundColor Green
Write-Host "Recrie o backend com: docker compose up -d --force-recreate backend"
