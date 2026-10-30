# Sleek Tech Pay Launch Script
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       STARTING SLEEK TECH PAY (POS PAYMENT PLATFORM)   " -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "Starting Backend on http://localhost:5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/backend'; npm run dev"

Start-Sleep -Seconds 2

Write-Host "Starting Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/frontend'; npm run dev"

Write-Host "All systems operational! Open http://localhost:5173 in your browser." -ForegroundColor Green
