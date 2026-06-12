# 🎬 Movie Watchlist

A full-stack movie watchlist application built to demonstrate modern DevOps practices: Docker, Docker Compose, GitHub Actions CI/CD, and Kubernetes.

Users can add movies to a personal watchlist, rate them, mark them as watched/unwatched, and filter the list — no authentication required.

## Tech Stack

| Layer    | Technology                                          |
| -------- | --------------------------------------------------- |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS   |
| Backend  | FastAPI, SQLAlchemy, Pydantic (Python 3.12)         |
| Database | PostgreSQL 16                                       |
| DevOps   | Docker, Docker Compose, GitHub Actions, Kubernetes  |

## Architecture

```mermaid
graph LR
    subgraph Client
        B[Browser]
    end

    subgraph Frontend
        F[Next.js<br/>:3000]
    end

    subgraph Backend
        A[FastAPI<br/>:8000]
    end

    subgraph Database
        P[(PostgreSQL<br/>:5432)]
    end

    B -->|HTTP| F
    B -->|"fetch() to NEXT_PUBLIC_API_URL"| A
    A -->|SQLAlchemy| P
```

- The **frontend** serves the UI; the browser calls the backend API directly using `fetch()` via the URL in `NEXT_PUBLIC_API_URL`. When that variable is empty, the app uses relative `/api` URLs — useful behind a Kubernetes ingress that routes `/api` to the backend.
- The **backend** exposes a REST API under `/api/movies` plus a `/health` endpoint, and creates the database schema automatically on startup.
- **PostgreSQL** stores the data on a persistent volume.

### API Endpoints

| Method | Path               | Description                              |
| ------ | ------------------ | ---------------------------------------- |
| GET    | `/api/movies`      | List movies (optional `?watched=true`)   |
| GET    | `/api/movies/{id}` | Get a single movie                       |
| POST   | `/api/movies`      | Create a movie                           |
| PUT    | `/api/movies/{id}` | Update a movie                           |
| DELETE | `/api/movies/{id}` | Delete a movie                           |
| GET    | `/health`          | Health check → `{"status": "ok"}`        |

Interactive API docs are available at `http://localhost:8000/docs` (Swagger UI).

## Project Structure

```
MovieWatchlist/
├── backend/              # FastAPI application
│   └── app/
│       ├── api/routes/   # HTTP route handlers
│       ├── core/         # Settings (env-based)
│       ├── database/     # Engine, session, base model
│       ├── models/       # SQLAlchemy models
│       ├── schemas/      # Pydantic schemas
│       └── services/     # CRUD business logic
├── frontend/             # Next.js application
│   └── src/
│       ├── app/          # App Router pages
│       ├── components/   # React components
│       ├── lib/          # API service layer (fetch)
│       └── types/        # TypeScript interfaces
├── k8s/                  # Kubernetes manifests
├── .github/workflows/    # CI/CD pipeline
└── docker-compose.yml
```

## Environment Variables

### Backend (`backend/.env.example`)

| Variable       | Default                                              | Description                       |
| -------------- | ---------------------------------------------------- | --------------------------------- |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5433/movies` | PostgreSQL connection string    |
| `CORS_ORIGINS` | `http://localhost:3000`                              | Comma-separated allowed origins   |

### Frontend (`frontend/.env.example`)

| Variable              | Default                 | Description                                                  |
| --------------------- | ----------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend base URL. **Baked in at build time.** Leave empty to use relative `/api` URLs (ingress setups). |

### Docker Compose (optional overrides)

| Variable            | Default    |
| ------------------- | ---------- |
| `POSTGRES_USER`     | `postgres` |
| `POSTGRES_PASSWORD` | `postgres` |
| `POSTGRES_DB`       | `movies`   |
| `POSTGRES_PORT`     | `5433` (host port; override if 5433 is already in use) |

## Local Development (Without Docker)

### 1. Start PostgreSQL

Any local PostgreSQL works; the quickest option is Docker:

```bash
docker run -d --name movies-db \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=movies \
  -p 5433:5432 postgres:16-alpine
```

### 2. Backend

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Running With Docker Compose

```bash
docker compose up -d
```

This builds and starts all three services:

| Service  | URL                    |
| -------- | ---------------------- |
| Frontend | http://localhost:3000  |
| Backend  | http://localhost:8000  |
| Postgres | localhost:5433         |

Useful commands:

```bash
docker compose ps          # status
docker compose logs -f     # follow logs
docker compose down        # stop (data is kept in the postgres_data volume)
docker compose down -v     # stop and delete data
```

## GitHub Actions Setup

The pipeline in [.github/workflows/ci.yml](.github/workflows/ci.yml) runs on every push to `main`:

1. Builds the backend and frontend Docker images (with GitHub Actions layer caching).
2. Logs in to Docker Hub.
3. Pushes both images tagged `latest` and with the commit SHA.

On pull requests it only builds (validates) the images without pushing.

> **Note:** GitHub only picks up workflows from `.github/` at the **repository root**. Push the `MovieWatchlist/` directory as its own repository (or move `.github/` to the root of your repo).

### Required Secrets

In your GitHub repository go to **Settings → Secrets and variables → Actions** and add:

| Secret            | Value                                       |
| ----------------- | ------------------------------------------- |
| `DOCKER_USERNAME` | Your Docker Hub username                    |
| `DOCKER_PASSWORD` | A Docker Hub access token (or password)     |

## Docker Hub Setup

1. Create an account at https://hub.docker.com.
2. Create two repositories: `movie-watchlist-frontend` and `movie-watchlist-backend` (public is fine; they are also created automatically on first push).
3. Generate an access token under **Account Settings → Security → Personal access tokens** and use it as `DOCKER_PASSWORD`.

## Kubernetes Deployment

The manifests in [k8s/](k8s/) create:

| Resource                       | Purpose                                        |
| ------------------------------ | ---------------------------------------------- |
| Namespace `movie-watchlist`    | Isolates all resources                         |
| Frontend Deployment + Service + ConfigMap | 2 replicas of the Next.js app      |
| Backend Deployment + Service + ConfigMap + Secret | 2 replicas of FastAPI, DB credentials in a Secret |
| Postgres StatefulSet + headless Service + Secret | Single replica with a 1Gi PVC (via `volumeClaimTemplates`) |
| Ingress (nginx)                | `/` → frontend, `/api` → backend               |

### 1. Prerequisites

- A cluster (minikube, kind, Docker Desktop, …) with the [nginx ingress controller](https://kubernetes.github.io/ingress-nginx/deploy/) installed.
  - minikube: `minikube addons enable ingress`
- Images pushed to Docker Hub (see CI above). For the ingress setup the frontend image must be built with an **empty** `NEXT_PUBLIC_API_URL` so the browser uses relative `/api` URLs (the CI pipeline does this by default):

  ```bash
  docker build --build-arg NEXT_PUBLIC_API_URL= -t <user>/movie-watchlist-frontend ./frontend
  ```

### 2. Image names

The deployments pull `andrejmilevski/movie-watchlist-backend:latest` and
`andrejmilevski/movie-watchlist-frontend:latest` from Docker Hub (published by CI).
If you fork this repo, change the image names in `k8s/backend-deployment.yaml` and
`k8s/frontend-deployment.yaml` to your own Docker Hub username.

### 3. Deploy

```bash
kubectl apply -f k8s/
kubectl get pods -n movie-watchlist
kubectl get svc -n movie-watchlist
kubectl get ingress -n movie-watchlist
```

### 4. Access the app

Add the ingress host to `/etc/hosts` (use `minikube ip` or the ingress controller's external IP):

```bash
echo "$(minikube ip) movie-watchlist.local" | sudo tee -a /etc/hosts
```

Then open http://movie-watchlist.local.

## Troubleshooting

| Problem | Fix |
| ------- | --- |
| **Port already in use** (3000/8000/5432) | Stop the conflicting process (`lsof -i :3000`) or change the host port mapping in `docker-compose.yml`. |
| **Backend can't connect to the database** | Check `docker compose logs postgres`. The backend retries for ~20s on startup; if it still fails, verify `DATABASE_URL` matches the Postgres credentials. |
| **CORS errors in the browser console** | Make sure the frontend origin (e.g. `http://localhost:3000`) is listed in the backend's `CORS_ORIGINS`. |
| **Frontend calls the wrong API URL** | `NEXT_PUBLIC_API_URL` is inlined at **build** time — changing it at runtime has no effect. Rebuild the image with the correct `--build-arg`. |
| **`ImagePullBackOff` in Kubernetes** | Verify you replaced `DOCKER_USERNAME` in the deployments and that the images exist on Docker Hub. |
| **Ingress returns 404** | Confirm the nginx ingress controller is running and you are using the `movie-watchlist.local` host from `/etc/hosts`. |
| **Postgres pod stuck `Pending`** | The PVC can't be bound — check `kubectl get pvc -n movie-watchlist` and ensure your cluster has a default StorageClass. |
| **Stale data / schema problems locally** | `docker compose down -v` removes the volume so the schema is recreated on next start. |
