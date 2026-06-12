from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.movie import Movie
from app.schemas.movie import MovieCreate, MovieUpdate


def list_movies(db: Session, watched: bool | None = None) -> list[Movie]:
    query = select(Movie).order_by(Movie.created_at.desc(), Movie.id.desc())
    if watched is not None:
        query = query.where(Movie.watched == watched)
    return list(db.scalars(query).all())


def get_movie(db: Session, movie_id: int) -> Movie | None:
    return db.get(Movie, movie_id)


def create_movie(db: Session, data: MovieCreate) -> Movie:
    movie = Movie(**data.model_dump())
    db.add(movie)
    db.commit()
    db.refresh(movie)
    return movie


def update_movie(db: Session, movie: Movie, data: MovieUpdate) -> Movie:
    for field, value in data.model_dump().items():
        setattr(movie, field, value)
    db.commit()
    db.refresh(movie)
    return movie


def delete_movie(db: Session, movie: Movie) -> None:
    db.delete(movie)
    db.commit()
