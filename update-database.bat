@echo off
echo ========================================
echo Updating Database Schema and Seeding Data
echo ========================================
echo.

echo Step 1: Pushing schema changes to database...
call npm run db:push
echo.

echo Step 2: Seeding database with coupons and scratch cards...
call node clear-and-seed.js
echo.

echo ========================================
echo Database update complete!
echo ========================================
pause
