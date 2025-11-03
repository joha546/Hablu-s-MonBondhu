# Hackathon Monorepo Backend Template

> Node.js + Express + MongoDB Atlas + Docker + React (Vite) frontend  
> Ready for hackathon projects or quick MVPs.

---

## Architecture Overview
- **Monorepo:** `backend/` | `client/` | `shared/`
- **Backend:** Node.js (ES6) + Express + Mongoose + Winston logging + Jest tests
- **Frontend:** React + Vite + Tailwind (port 5173)
- **Database:** MongoDB Atlas (managed, no replica set handling)
- **Infra:** Docker Compose (`compose.dev.yml`, `compose.prod.yml`)
- **Messaging / Queue:** RabbitMQ (for future use, `shared/rabbitmq`)

---

## Quick Start (Dev)

```bash
# start backend + frontend + RabbitMQ
make dev

# stop containers
make down

# view logs
make logs

# run backend tests
make test-backend
````

* Backend runs on: `http://localhost:2222`
* Frontend runs on: `http://localhost:5173`

---

## Backend Features

* Healthcheck: `GET /api/healthCheck`
* CORS + Helmet enabled
* Centralized logging with Winston
* Jest unit tests
* Environment config via `.env` files

---

## Frontend Features

* Dev proxy: `/api` → backend container
* Vite + React + Tailwind setup
* Axios configured to use `VITE_API_BASE` environment variable

---

## Conventions

* Backend: `src/controllers`, `src/services`, `src/models`, `src/utils`
* Frontend: `src/App.jsx` main entry
* Docker: shared network ensures container-to-container connectivity
* Makefile handles common dev commands

---

## Notes

* MongoDB Atlas URL set via `backend/.env` (`MONGO_URI`)
* Use `/api/*` for all backend routes to ensure proxying
* This is a **hackathon-ready template** — just extend controllers/services as needed

---

> Keep it short, code-focused, and everything spins up in **one command**.

```
