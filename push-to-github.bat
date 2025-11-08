@echo off
echo ========================================
echo Pushing GreenIntelligence-1 to GitHub
echo ========================================
echo.

echo Step 1: Initializing Git repository...
git init
echo.

echo Step 2: Adding all files...
git add .
echo.

echo Step 3: Creating initial commit...
git commit -m "Initial commit: GreenIntelligence sustainability app"
echo.

echo Step 4: Adding remote repository...
git remote add origin https://github.com/Nayana-M12/VIBE__0088.git
echo.

echo Step 5: Pushing to GitHub...
git branch -M main
git push -u origin main --force
echo.

echo ========================================
echo Done! Check your repository at:
echo https://github.com/Nayana-M12/VIBE__0088
echo ========================================
pause
