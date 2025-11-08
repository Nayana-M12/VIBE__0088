@echo off
echo Pushing code to GitHub...
echo.

REM Check if remote exists
git remote -v | findstr "VIBE__0088" >nul
if %errorlevel% neq 0 (
    echo Adding remote repository...
    git remote add origin https://github.com/Nayana-M12/VIBE__0088.git
) else (
    echo Remote already exists, updating URL...
    git remote set-url origin https://github.com/Nayana-M12/VIBE__0088.git
)

echo.
echo Checking git status...
git status

echo.
echo Adding all files...
git add .

echo.
echo Committing changes...
git commit -m "Update: Fixed connection request system and pushed database schema"

echo.
echo Pushing to GitHub...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo Push failed. Trying to push to master branch...
    git push -u origin master
)

echo.
echo Done!
pause
