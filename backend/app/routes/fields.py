import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import FieldConfiguration
from ..schemas import FieldCreate, FieldResponse


router = APIRouter(
    prefix="/fields",
    tags=["Field Configuration"],
)


@router.post(
    "/",
    response_model=FieldResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_field(
    field: FieldCreate,
    db: Session = Depends(get_db),
):
    existing_field = (
        db.query(FieldConfiguration)
        .filter(FieldConfiguration.name == field.name)
        .first()
    )

    if existing_field:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Field with name '{field.name}' already exists.",
        )

    db_field = FieldConfiguration(
        name=field.name,
        field_type=field.field_type,
        required=field.required,
        options=json.dumps(field.options) if field.options else None,
    )

    try:
        db.add(db_field)
        db.commit()
        db.refresh(db_field)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Field with name '{field.name}' already exists.",
        )

    return FieldResponse(
        id=db_field.id,
        name=db_field.name,
        field_type=db_field.field_type,
        required=db_field.required,
        options=json.loads(db_field.options)
        if db_field.options
        else None,
    )


@router.get("/", response_model=list[FieldResponse])
def get_fields(
    db: Session = Depends(get_db),
):
    fields = db.query(FieldConfiguration).all()

    return [
        FieldResponse(
            id=field.id,
            name=field.name,
            field_type=field.field_type,
            required=field.required,
            options=json.loads(field.options)
            if field.options
            else None,
        )
        for field in fields
    ]