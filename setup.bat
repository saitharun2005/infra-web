@echo off
echo 🏗️  B&G Infrastructures Expense Tracker Setup
echo ==============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed
echo.

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully
) else (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo 🔥 Firebase Setup Required:
echo 1. Go to https://console.firebase.google.com/
echo 2. Create a new project
echo 3. Enable Firestore Database
echo 4. Copy your Firebase config
echo 5. Update src/firebase/config.js with your config
echo.
echo 🚀 To start the application:
echo    npm start
echo.
echo 📱 The app will open at http://localhost:3000
echo.
echo 🎉 Setup complete! Happy expense tracking!
pause

