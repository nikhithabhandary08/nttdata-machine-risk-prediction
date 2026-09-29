import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import FieldConfiguration, MachineValue
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


@router.get(
    "/",
    response_model=list[FieldResponse],
)
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


@router.delete(
    "/{field_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_field(
    field_id: int,
    db: Session = Depends(get_db),
):
    field = (
        db.query(FieldConfiguration)
        .filter(FieldConfiguration.id == field_id)
        .first()
    )

    if not field:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Field not found.",
        )

    protected_fields = {
        "Machine Name",
        "Temperature",
        "Pressure",
        "Vibration",
    }

    if field.name in protected_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"'{field.name}' is a protected field and cannot be deleted.",
        )

    field_in_use = (
        db.query(MachineValue)
        .filter(MachineValue.field_id == field_id)
        .first()
    )

    if field_in_use:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"'{field.name}' cannot be deleted because it is already "
                "used by an existing machine record."
            ),
        )

    db.delete(field)
    db.commit()