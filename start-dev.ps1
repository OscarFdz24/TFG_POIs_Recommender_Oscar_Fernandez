$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $root "project-root\backend"
$frontendPath = Join-Path $root "project-root\frontend"
$defaultCondaPython = "C:\Users\User\miniconda3\envs\master_ds_clean\python.exe"
$pythonBin = if (Test-Path $defaultCondaPython) { $defaultCondaPython } else { "python" }

function Convert-ToPowerShellSingleQuotedString($value) {
    return "'" + ($value -replace "'", "''") + "'"
}

if (-not (Test-Path $backendPath)) {
    throw "No se encontro la carpeta del backend: $backendPath"
}

if (-not (Test-Path $frontendPath)) {
    throw "No se encontro la carpeta del frontend: $frontendPath"
}

Write-Host "Arrancando backend en http://localhost:4000 ..."
$backendCommand = @(
    "`$env:PYTHON_BIN = $(Convert-ToPowerShellSingleQuotedString $pythonBin)"
    "Set-Location -LiteralPath $(Convert-ToPowerShellSingleQuotedString $backendPath)"
    "npm run dev"
) -join "; "

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    $backendCommand
)

Write-Host "Arrancando frontend en http://localhost:5173 ..."
$frontendCommand = @(
    "Set-Location -LiteralPath $(Convert-ToPowerShellSingleQuotedString $frontendPath)"
    "npm run dev"
) -join "; "

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    $frontendCommand
)

Write-Host ""
Write-Host "Listo. Abre la web en: http://localhost:5173"
Write-Host "Backend API: http://localhost:4000/api/health"
