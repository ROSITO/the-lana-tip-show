#!/bin/bash
# Script pour définir POSTGRES_URL à partir de lana_POSTGRES_URL si nécessaire
# Ce script doit être exécuté AVANT les commandes Prisma

if [ -z "$POSTGRES_URL" ]; then
  # Essayer les variantes avec préfixe lana_ ou autres formats
  if [ -n "$lana_POSTGRES_URL" ]; then
    export POSTGRES_URL="$lana_POSTGRES_URL"
    echo "✅ POSTGRES_URL défini à partir de lana_POSTGRES_URL"
  elif [ -n "$PRISMA_DATABASE_URL" ]; then
    export POSTGRES_URL="$PRISMA_DATABASE_URL"
    echo "✅ POSTGRES_URL défini à partir de PRISMA_DATABASE_URL"
  elif [ -n "$lana_PRISMA_DATABASE_URL" ]; then
    export POSTGRES_URL="$lana_PRISMA_DATABASE_URL"
    echo "✅ POSTGRES_URL défini à partir de lana_PRISMA_DATABASE_URL"
  elif [ -n "$DATABASE_URL" ]; then
    export POSTGRES_URL="$DATABASE_URL"
    echo "✅ POSTGRES_URL défini à partir de DATABASE_URL"
  elif [ -n "$lana_DATABASE_URL" ]; then
    export POSTGRES_URL="$lana_DATABASE_URL"
    echo "✅ POSTGRES_URL défini à partir de lana_DATABASE_URL"
  else
    echo "⚠️ Aucune variable de base de données trouvée"
  fi
else
  echo "✅ POSTGRES_URL déjà défini"
fi


