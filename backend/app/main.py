import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.movies import router as movies_router
from app.core.config import get_settings
from app.database.session import Base, engine

logger = logging.getLogger("uvicorn.error")


def init_db(retries: int = 10, delay_seconds: float = 2.0) -> None:
    # Postgres may still be starting when the container comes up.
    for attempt in range(1, retries + 1):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except Exception as exc:
            if attempt == retries:
                raise
            logger.warning("Database not ready (attempt %d/%d): %s", attempt, retries, exc)
            time.sleep(delay_seconds)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Movie Watchlist API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(movies_router)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
