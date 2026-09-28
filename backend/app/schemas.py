from pydantic import BaseModel, ConfigDict, Field
from typing import Literal


class FieldCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    field_type: Literal["text", "number", "dropdown"]
    required: bool = False
    options: list[str] | None = None


class FieldResponse(BaseModel):
    id: int
    name: str
    field_type: str
    required: bool
    options: list[str] | None = None

    model_config = ConfigDict(from_attributes=True)