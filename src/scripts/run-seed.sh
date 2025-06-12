#!/bin/bash

echo "🚗 Running car listings seeder..."

# Install required packages if not already installed
if ! npm list @faker-js/faker > /dev/null 2>&1; then
  echo "📦 Installing @faker-js/faker..."
  npm install @faker-js/faker
fi

if ! npm list tsx > /dev/null 2>&1; then
  echo "📦 Installing tsx..."
  npm install tsx
fi

# Run the seeder script
echo "🌱 Starting seed process..."
npx tsx scripts/seed-listings.ts

echo "✅ Seed process completed!"
