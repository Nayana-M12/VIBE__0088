@echo off
echo ========================================
echo Running Database Migration
echo ========================================
echo.
echo This will add the new columns to user_follows table:
echo - status (pending/accepted/rejected)
echo - respondedAt (timestamp)
echo.

call npm run db:push

echo.
echo ========================================
echo Migration Complete!
echo ========================================
echo.
echo Now restart your dev server:
echo npm run dev
echo.
pause
