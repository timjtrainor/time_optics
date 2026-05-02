#!/bin/bash

# Sidejot Startup Script
# Handles Docker container startup and database migrations

echo "🚀 Starting Sidejot environment..."

# Check if .env exists, if not create a template
if [ ! -f .env ]; then
  echo "📝 Creating .env from template..."
  echo "DATABASE_URL=postgresql://postgres:postgres@db:5432/sidejot?schema=public" > .env
  echo "POSTGRES_USER=postgres" >> .env
  echo "POSTGRES_PASSWORD=postgres" >> .env
  echo "POSTGRES_DB=sidejot" >> .env
  echo "OPENROUTER_API_KEY=your_key_here" >> .env
fi

# Start containers
if command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE="docker-compose"
else
  DOCKER_COMPOSE="docker compose"
fi

$DOCKER_COMPOSE up -d

echo "⏳ Waiting for database to be ready..."
# Wait for DB healthcheck using the service name instead of container name
while [ "$($DOCKER_COMPOSE ps -q db | xargs docker inspect -f '{{.State.Health.Status}}' 2>/dev/null)" != "healthy" ]; do
  sleep 2
  echo -n "."
done
echo ""

echo "🔄 Running database migrations..."
# Use the service name 'app' instead of hardcoded container name
$DOCKER_COMPOSE exec app bunx prisma db push

echo "✅ Sidejot is ready! Open http://localhost:3000"
