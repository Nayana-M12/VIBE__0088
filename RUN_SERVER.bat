@echo off
echo ========================================
echo  Starting GreenIntelligence Server
echo ========================================
echo.

cd /d "%~dp0"

echo Starting development server...
echo.
echo Server will be available at:
echo   - Local:   http://localhost:5000
echo   - Network: Check the output below
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npm run dev
