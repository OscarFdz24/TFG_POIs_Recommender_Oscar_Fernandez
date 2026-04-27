$ErrorActionPreference = "Stop"

# Script de desarrollo para arrancar backend y frontend a la vez.
# Se ejecuta desde la raiz del repositorio con: .\start-dev.ps1

# Carpeta raiz donde esta este script.
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# Rutas reales de las dos aplicaciones.
$backendPath = Join-Path $root "project-root\backend"
$frontendPath = Join-Path $root "project-root\frontend"

# Entorno Python usado en los notebooks. Contiene pandas, scikit-learn y pyarrow.
$defaultCondaPython = "C:\Users\User\miniconda3\envs\master_ds_clean\python.exe"

# Si el entorno Conda existe, lo usa el backend para ejecutar el recomendador.
$pythonBin = if (Test-Path $defaultCondaPython) { $defaultCondaPython } else { "python" }

function Convert-ToPowerShellSingleQuotedString($value) {
    # Escapa rutas con espacios para que PowerShell no rompa comandos como cd.
    return "'" + ($value -replace "'", "''") + "'"
}

# Validamos que las carpetas esperadas existen antes de abrir ventanas nuevas.
if (-not (Test-Path $backendPath)) {
    throw "No se encontro la carpeta del backend: $backendPath"
}

if (-not (Test-Path $frontendPath)) {
    throw "No se encontro la carpeta del frontend: $frontendPath"
}

Write-Host "Arrancando backend en http://localhost:4000 ..."

# PYTHON_BIN le dice a Node que interprete usar para lanzar ml_service/recommend_route.py.
$backendCommand = @(
    "`$env:PYTHON_BIN = $(Convert-ToPowerShellSingleQuotedString $pythonBin)"
    "Set-Location -LiteralPath $(Convert-ToPowerShellSingleQuotedString $backendPath)"
    "npm run dev"
) -join "; "

# Abrimos una ventana independiente para el backend.
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    $backendCommand
)

Write-Host "Arrancando frontend en http://localhost:5173 ..."

# El frontend solo necesita entrar en su carpeta y ejecutar Vite.
$frontendCommand = @(
    "Set-Location -LiteralPath $(Convert-ToPowerShellSingleQuotedString $frontendPath)"
    "npm run dev"
) -join "; "

# Abrimos una ventana independiente para el frontend.
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    $frontendCommand
)

Write-Host ""
Write-Host "Listo. Abre la web en: http://localhost:5173"
Write-Host "Backend API: http://localhost:4000/api/health"
