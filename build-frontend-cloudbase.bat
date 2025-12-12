@echo off
echo Building frontend for CloudBase deployment...

cd frontend

if exist "dist" (
    echo Removing existing dist directory...
    rmdir /s /q dist
)

echo Building frontend with Docker...
docker build -t stockstudy-frontend-build -f Dockerfile.prod .
docker run --rm -v "%cd%/dist:/app/dist" stockstudy-frontend-build npm run build

echo Frontend build completed!
if exist "dist" (
    echo dist directory created successfully
    dir dist
) else (
    echo ERROR: dist directory not found
)

pause