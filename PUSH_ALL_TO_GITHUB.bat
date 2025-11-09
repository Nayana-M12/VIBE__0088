@echo off
echo ========================================
echo  Pushing All Code to GitHub
echo  Repository: VIBE__0088
echo ========================================
echo.

cd /d "%~dp0"

echo [1/6] Checking git configuration...
git remote -v | findstr "VIBE__0088" >nul
if %errorlevel% neq 0 (
    echo Adding remote repository...
    git remote add origin https://github.com/Nayana-M12/VIBE__0088.git
    echo Remote added successfully!
) else (
    echo Remote already configured.
    git remote set-url origin https://github.com/Nayana-M12/VIBE__0088.git
)

echo.
echo [2/6] Checking current status...
git status

echo.
echo [3/6] Adding all files...
git add .
echo Files added!

echo.
echo [4/6] Committing changes...
git commit -m "Update: Connection request system, database migration, and documentation"
if %errorlevel% equ 0 (
    echo Commit successful!
) else (
    echo No changes to commit or commit failed.
)

echo.
echo [5/6] Pushing to GitHub (main branch)...
git push -u origin main
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo  SUCCESS! Code pushed to GitHub!
    echo ========================================
    goto :end
)

echo.
echo Main branch push failed. Trying master branch...
git push -u origin master
if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo  SUCCESS! Code pushed to GitHub!
    echo ========================================
    goto :end
)

echo.
echo ========================================
echo  Push failed. Please check:
echo  1. Internet connection
echo  2. GitHub authentication
echo  3. Repository permissions
echo ========================================

:end
echo.
echo [6/6] Done!
pause
