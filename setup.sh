#!/bin/bash

echo "========================================"
echo "OpenClaw Skills Marketplace - Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/5] Node.js detected: $(node --version)"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "[2/5] Creating .env.local from template..."
    cp .env.local.example .env.local
    echo ""
    echo "WARNING: Please edit .env.local with your API keys!"
    echo "- Supabase URL and keys"
    echo "- Stripe keys"
    echo ""
    read -p "Press Enter to edit .env.local..."
    ${EDITOR:-nano} .env.local
else
    echo "[2/5] .env.local already exists"
fi
echo ""

# Install dependencies
echo "[3/5] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: npm install failed!"
    exit 1
fi
echo ""

# Database setup reminder
echo "[4/5] Database setup reminder:"
echo "Have you run the SQL schema in Supabase?"
echo ""
echo "1. Go to your Supabase project"
echo "2. SQL Editor → New Query"
echo "3. Run database/schema.sql"
echo "4. Run database/rls-policies.sql"
echo ""
read -p "Press Enter when database is ready (or 's' to skip): "
echo ""

# Start dev server
echo "[5/5] Starting development server..."
echo ""
echo "The marketplace will open at http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
sleep 2
npm run dev
