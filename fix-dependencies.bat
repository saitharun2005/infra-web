@echo off
echo 🔧 Fixing dependency issues...
echo.

echo 🗑️ Removing node_modules and package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo 📦 Installing dependencies with clean cache...
npm cache clean --force
npm install

echo.
echo ✅ Dependencies fixed! Now you can run:
echo    npm start
echo.
pause

