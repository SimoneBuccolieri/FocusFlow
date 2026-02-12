#!/bin/bash

# Update script for FocusFlow

echo "🔄 Checking for updates..."
git pull

echo "🐳 Rebuilding and restarting containers..."
docker-compose up -d --build

echo "📦 Running database migrations..."
# Using the specific command for the standalone configuration
docker-compose run --rm focus-flow npx prisma migrate deploy

echo "✅ Update complete! FocusFlow is running on the new version."
