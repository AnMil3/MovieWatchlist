from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MovieBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    genre: str = Field(min_length=1, max_length=100)
    rating: int = Field(ge=1, le=10)
    watched: bool = False


class MovieCreate(MovieBase):
    pass


class MovieUpdate(MovieBase):
    pass


class MovieResponse(MovieBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
