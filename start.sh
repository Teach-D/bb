#!/bin/bash
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting PostgreSQL via Docker..."
cd "$ROOT_DIR"
docker compose up -d || { echo "Docker failed. Make sure Docker Desktop is running."; exit 1; }

echo "Waiting for PostgreSQL to be ready..."
sleep 3

echo "Starting backend (Spring Boot)..."
cd "$ROOT_DIR/backend"
./gradlew bootRun &
BACKEND_PID=$!

echo "Starting frontend (React)..."
cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "All services are running:"
echo "  PostgreSQL: localhost:5432"
echo "  Backend   : http://localhost:8080  (PID: $BACKEND_PID)"
echo "  Frontend  : http://localhost:3000  (PID: $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop backend and frontend (DB keeps running)."
echo "To stop DB: docker compose down"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait
