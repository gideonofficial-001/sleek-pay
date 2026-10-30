@echo off
title Sleek Tech Pay
echo ========================================================
echo        STARTING SLEEK TECH PAY (POS PAYMENT PLATFORM)
echo ========================================================
echo.
echo 1. Starting Backend API on http://localhost:5000 ...
start "Sleek Pay Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo 2. Starting Frontend Web App on http://localhost:5173 ...
start "Sleek Pay Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Ready! Open your browser at http://localhost:5173
echo ========================================================
