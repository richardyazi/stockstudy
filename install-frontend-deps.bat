@echo off
chcp 65001 >nul
echo Installing Frontend Dependencies for Stock Trend Practice Website...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed
    echo Please download and install Node.js from: https://nodejs.org/
    echo Recommended version: Node.js 18 or later
    echo.
    echo After installation, restart the command prompt and run this script again
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed or not in PATH
    echo Please make sure Node.js installation includes npm
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo npm version:
npm --version
echo.

echo Installing frontend dependencies...
cd frontend
npm install

if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    echo Please check the error messages above
    pause
    exit /b 1
)

echo.
echo SUCCESS: Frontend dependencies installed successfully!
echo.
echo You can now run the frontend development server with:
echo   npm run dev
echo.
pause