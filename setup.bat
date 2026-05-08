@echo off
echo ========================================
echo OpenClaw Skills Marketplace - Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Node.js detected: 
node --version
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo [2/5] Creating .env.local from template...
    copy .env.local.example .env.local
    echo.
    echo WARNING: Please edit .env.local with your API keys!
    echo - Supabase URL and keys
    echo - Stripe keys
    echo.
    echo Press any key to open .env.local in notepad...
    pause >nul
    notepad .env.local
) else (
    echo [2/5] .env.local already exists
)
echo.

REM Install dependencies
echo [3/5] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo.

REM Check if database is set up
echo [4/5] Database setup reminder:
echo Have you run the SQL schema in Supabase?
echo.
echo 1. Go to your Supabase project
echo 2. SQL Editor - New Query
echo 3. Run database/schema.sql
echo 4. Run database/rls-policies.sql
echo.
set /p DB_READY="Press Enter when database is ready (or 's' to skip): "
echo.

REM Start dev server
echo [5/5] Starting development server...
echo.
echo The marketplace will open at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
timeout /t 3 >nul
call npm run dev
