from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Literal


class FieldCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    field_type: Literal["text", "number", "dropdown"]
    required: bool = False
    options: list[str] | None = None

    @field_validator("options")
    @classmethod
    def validate_options(cls, value, info):
        field_type = info.data.get("field_type")

        if field_type == "dropdown":
            if not value:
                raise ValueError(
                    "Dropdown fields must have at least one option."
                )

            cleaned_options = [option.strip() for option in value]

            if any(not option for option in cleaned_options):
                raise ValueError("Dropdown options cannot be empty.")

            if len(cleaned_options) != len(set(cleaned_options)):
                raise ValueError("Dropdown options must be unique.")

            return cleaned_options

        if field_type in {"text", "number"} and value is not None:
            raise ValueError(
                "Only dropdown fields can have options."
            )

        return value

class FieldResponse(BaseModel):
    id: int
    name: str
    field_type: str
    required: bool
    options: list[str] | None = None

    model_config = ConfigDict(from_attributes=True)


class MachineValueCreate(BaseModel):
    field_id: int = Field(gt=0)
    value: str


class MachineCreate(BaseModel):
    values: list[MachineValueCreate]


class MachineValueResponse(BaseModel):
    field_id: int
    field_name: str
    value: str


class MachineResponse(BaseModel):
    id: int
    values: list[MachineValueResponse]


class RiskPredictionRequest(BaseModel):
    temperature: float
    pressure: float
    vibration: Literal["Low", "Medium", "High"]


class RiskPredictionResponse(BaseModel):
    risk: str