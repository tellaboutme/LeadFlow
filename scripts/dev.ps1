$root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path "$root\backend") -or -not (Test-Path "$root\frontend")) {
    Write-Error "Complete M01 first."
    exit 1
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; uv run uvicorn app.main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:5173"
