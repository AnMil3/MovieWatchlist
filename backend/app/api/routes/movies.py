from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.movie import Movie
from app.schemas.movie import MovieCreate, MovieResponse, MovieUpdate
from app.services import movie_service

router = APIRouter(prefix="/api/movies", tags=["movies"])


def get_movie_or_404(movie_id: int, db: Session = Depends(get_db)) -> Movie:
    movie = movie_service.get_movie(db, movie_id)
    if movie is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")
    return movie


@router.get("", response_model=list[MovieResponse])
def list_movies(watched: bool | None = None, db: Session = Depends(get_db)) -> list[Movie]:
    return movie_service.list_movies(db, watched)


@router.get("/{movie_id}", response_model=MovieResponse)
def get_movie(movie: Movie = Depends(get_movie_or_404)) -> Movie:
    return movie


@router.post("", response_model=MovieResponse, status_code=status.HTTP_201_CREATED)
def create_movie(data: MovieCreate, db: Session = Depends(get_db)) -> Movie:
    return movie_service.create_movie(db, data)


@router.put("/{movie_id}", response_model=MovieResponse)
def update_movie(
    data: MovieUpdate,
    movie: Movie = Depends(get_movie_or_404),
    db: Session = Depends(get_db),
) -> Movie:
    return movie_service.update_movie(db, movie, data)


@router.delete("/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_movie(
    movie: Movie = Depends(get_movie_or_404), db: Session = Depends(get_db)
) -> None:
    movie_service.delete_movie(db, movie)
