#!/bin/bash

echo "🏗️  B&G Infrastructures Expense Tracker Setup"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🔥 Firebase Setup Required:"
echo "1. Go to https://console.firebase.google.com/"
echo "2. Create a new project"
echo "3. Enable Firestore Database"
echo "4. Copy your Firebase config"
echo "5. Update src/firebase/config.js with your config"
echo ""
echo "🚀 To start the application:"
echo "   npm start"
echo ""
echo "📱 The app will open at http://localhost:3000"
echo ""
echo "🎉 Setup complete! Happy expense tracking!"

