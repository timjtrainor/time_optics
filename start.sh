#!/bin/bash

# Sidejot Startup Script
# Handles Docker container startup and database migrations

echo "🚀 Starting Sidejot environment..."

# Check if .env exists, if not create a template
if [ ! -f .env ]; then
  echo "📝 Creating .env from template..."
  echo "DATABASE_URL=postgresql://time_optics:time_optics@db:5432/time_optics?schema=public" > .env
  echo "POSTGRES_USER=time_optics" >> .env
  echo "POSTGRES_PASSWORD=time_optics" >> .env
  echo "POSTGRES_DB=time_optics" >> .env
  echo "OPENROUTER_API_KEY=your_key_here" >> .env
fi

# Start containers with build to ensure schema is sync'd
if command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE="docker-compose"
else
  DOCKER_COMPOSE="docker compose"
fi

$DOCKER_COMPOSE up -d --build

echo "⏳ Waiting for database to be ready..."
# Wait for DB healthcheck using the service name instead of container name
while [ "$($DOCKER_COMPOSE ps -q db | xargs docker inspect -f '{{.State.Health.Status}}' 2>/dev/null)" != "healthy" ]; do
  sleep 2
  echo -n "."
done
echo ""

echo "🔄 Running database migrations..."
# Use the service name 'app' instead of hardcoded container name
$DOCKER_COMPOSE exec app bunx prisma db push --accept-data-loss

echo "✅ Sidejot is ready! Open http://localhost:3000"
