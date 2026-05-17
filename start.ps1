$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting PostgreSQL via Docker..." -ForegroundColor Magenta
Set-Location $root
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker failed. Make sure Docker Desktop is running." -ForegroundColor Red
    exit 1
}

Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Magenta
Start-Sleep -Seconds 3

Write-Host "Starting backend (Spring Boot)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; .\gradlew.bat bootRun"

Write-Host "Starting frontend (React)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "All services are starting:" -ForegroundColor Yellow
Write-Host "  PostgreSQL: localhost:5432" -ForegroundColor Magenta
Write-Host "  Backend   : http://localhost:8080" -ForegroundColor Cyan
Write-Host "  Frontend  : http://localhost:3000" -ForegroundColor Green
