#!/bin/bash

# Update script for FocusFlow
# Esci immediatamente se un comando fallisce
set -e

echo "🔄 Checking for updates..."
if git pull | grep -q 'Already up to date.'; then
    echo "✅ FocusFlow is already at the latest version."
    exit 0
fi

echo "📦 Running database migrations..."
# È meglio far girare le migrazioni PRIMA di riavviare i container definitivi
# per assicurarsi che lo schema sia pronto per il nuovo codice.
docker compose run --rm -e DATABASE_URL=file:/app/db/prod.db focus-flow npx --yes prisma migrate deploy

echo "🐳 Rebuilding and restarting containers..."
# --build ricrea le immagini, -d riavvia in background, 
# --remove-orphans pulisce eventuali servizi rimossi
docker compose up -d --build --remove-orphans

echo "✅ Update complete! FocusFlow is running on the new version."