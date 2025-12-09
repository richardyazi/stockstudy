@echo off
chcp 65001 >nul
echo Installing Stock Trend Practice Website dependencies...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed
    echo Please download and install Docker Desktop from: https://www.docker.com/products/docker-desktop
    echo After installation, make sure to enable WSL2 backend
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Compose is not installed
    echo Please make sure you have installed Docker Desktop which includes Docker Compose
    pause
    exit /b 1
)

echo SUCCESS: Docker environment check passed
echo.
echo Installation instructions:
echo    1. Make sure Docker Desktop is running
echo    2. Ensure WSL2 backend is enabled
echo    3. Run start.bat to start the services
echo.
pause