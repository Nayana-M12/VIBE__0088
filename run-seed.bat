@echo off
echo ========================================
echo Seeding Database with Rewards
echo ========================================
echo.

echo Running seed script...
npx tsx server/seed.ts

echo.
echo ========================================
echo Done!
echo ========================================
pause
