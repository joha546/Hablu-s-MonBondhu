# ============================
# Hackathon Starter Makefile
# ============================

# Default
.DEFAULT_GOAL := help

# Load environment variables
include backend/shared/.env
export 

.PHONY: help setup dev test logs

help:
	@echo "Available commands:"
	@echo "  make setup   -> Install deps, build Docker image"
	@echo "  make dev     -> Run backend in Docker with hot reload"
	@echo "  make test    -> Run Jest tests"
	@echo "  make logs    -> Show backend logs"
	@echo "  make seed    -> Seed DB with initial data"

# Install dependencies and build Docker
setup:
	cd backend && npm install
	docker compose -f compose.dev.yml build

# Start backend in Docker (dev mode)
dev:
	docker compose -f compose.dev.yml up --build

# Stop containers
down:
	docker compose -f compose.dev.yml down

# Run Jest tests
test:
	cd backend && npm run test

# Show logs for backend container
logs:
	docker logs -f hackathon-backend