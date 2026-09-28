from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import FieldConfiguration, MachineRecord, MachineValue
from ..schemas import MachineCreate, MachineResponse


router = APIRouter(
    prefix="/machines",
    tags=["Machine Records"],
)


@router.post(
    "/",
    response_model=MachineResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_machine(
    machine: MachineCreate,
    db: Session = Depends(get_db),
):
    # Make sure at least one value is provided
    if not machine.values:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one machine field value is required.",
        )

    # Get all submitted field IDs
    field_ids = [item.field_id for item in machine.values]

    # Prevent the same field from being submitted more than once
    if len(field_ids) != len(set(field_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Each field can only be provided once.",
        )

    # Fetch the configured fields from the database
    fields = (
        db.query(FieldConfiguration)
        .filter(FieldConfiguration.id.in_(field_ids))
        .all()
    )

    # Create a lookup dictionary:
    # {field_id: FieldConfiguration}
    fields_by_id = {
        field.id: field
        for field in fields
    }

    # Check whether any submitted field ID does not exist
    missing_field_ids = [
        field_id
        for field_id in field_ids
        if field_id not in fields_by_id
    ]

    if missing_field_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Field(s) not found: {missing_field_ids}",
        )

    # Validate each submitted value
    for item in machine.values:
        field = fields_by_id[item.field_id]

        # Required field cannot contain an empty value
        if field.required and not item.value.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Field '{field.name}' is required.",
            )

        # Validate number fields
        if field.field_type == "number":
            try:
                float(item.value)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Field '{field.name}' must contain a number.",
                )

        # Validate dropdown fields
        if field.field_type == "dropdown":
            import json

            options = []

            if field.options:
                options = json.loads(field.options)

            if item.value not in options:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Invalid value for '{field.name}'. "
                        f"Allowed values: {options}"
                    ),
                )

    # IMPORTANT:
    # Fetch ALL configured fields, not only the fields submitted
    # by the user. This allows us to detect missing required fields.
    all_fields = db.query(FieldConfiguration).all()

    # Find all configured fields that are required
    required_fields = [
        field
        for field in all_fields
        if field.required
    ]

    # IDs of fields submitted by the user
    provided_field_ids = set(field_ids)

    # Find required fields that were not submitted
    missing_required_fields = [
        field.name
        for field in required_fields
        if field.id not in provided_field_ids
    ]

    if missing_required_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Missing required field(s): "
                f"{missing_required_fields}"
            ),
        )

    # Create the machine record
    db_machine = MachineRecord()

    db.add(db_machine)

    # Get the generated machine ID before creating MachineValue rows
    db.flush()

    response_values = []

    # Create one MachineValue for each submitted field
    for item in machine.values:
        field = fields_by_id[item.field_id]

        db_value = MachineValue(
            machine_id=db_machine.id,
            field_id=field.id,
            value=item.value,
        )

        db.add(db_value)

        response_values.append(
            {
                "field_id": field.id,
                "field_name": field.name,
                "value": item.value,
            }
        )

    # Save everything
    db.commit()

    # Refresh the machine record
    db.refresh(db_machine)

    # Return the created machine
    return MachineResponse(
        id=db_machine.id,
        values=response_values,
    )


@router.get(
    "/",
    response_model=list[MachineResponse],
)
def get_machines(
    db: Session = Depends(get_db),
):
    machines = (
        db.query(MachineRecord)
        .order_by(MachineRecord.id)
        .all()
    )

    response = []

    for machine in machines:
        values = []

        for machine_value in machine.values:
            values.append(
                {
                    "field_id": machine_value.field_id,
                    "field_name": machine_value.field.name,
                    "value": machine_value.value,
                }
            )

        response.append(
            MachineResponse(
                id=machine.id,
                values=values,
            )
        )

    return response


@router.get(
    "/{machine_id}",
    response_model=MachineResponse,
)
def get_machine(
    machine_id: int,
    db: Session = Depends(get_db),
):
    machine = (
        db.query(MachineRecord)
        .filter(MachineRecord.id == machine_id)
        .first()
    )

    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine with ID {machine_id} not found.",
        )

    response_values = []

    for machine_value in machine.values:
        response_values.append(
            {
                "field_id": machine_value.field_id,
                "field_name": machine_value.field.name,
                "value": machine_value.value,
            }
        )

    return MachineResponse(
        id=machine.id,
        values=response_values,
    )


@router.put(
    "/{machine_id}",
    response_model=MachineResponse,
)
def update_machine(
    machine_id: int,
    machine: MachineCreate,
    db: Session = Depends(get_db),
):
    # Check whether the machine exists
    db_machine = (
        db.query(MachineRecord)
        .filter(MachineRecord.id == machine_id)
        .first()
    )

    if not db_machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine with ID {machine_id} not found.",
        )

    # Make sure at least one value is provided
    if not machine.values:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one machine field value is required.",
        )

    # Get submitted field IDs
    field_ids = [item.field_id for item in machine.values]

    # Prevent duplicate fields
    if len(field_ids) != len(set(field_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Each field can only be provided once.",
        )

    # Fetch the submitted field configurations
    fields = (
        db.query(FieldConfiguration)
        .filter(FieldConfiguration.id.in_(field_ids))
        .all()
    )

    fields_by_id = {
        field.id: field
        for field in fields
    }

    # Check for unknown field IDs
    missing_field_ids = [
        field_id
        for field_id in field_ids
        if field_id not in fields_by_id
    ]

    if missing_field_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Field(s) not found: {missing_field_ids}",
        )

    # Validate submitted values
    for item in machine.values:
        field = fields_by_id[item.field_id]

        # Required fields cannot be empty
        if field.required and not item.value.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Field '{field.name}' is required.",
            )

        # Number validation
        if field.field_type == "number":
            try:
                float(item.value)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Field '{field.name}' must contain a number.",
                )

        # Dropdown validation
        if field.field_type == "dropdown":
            import json

            options = []

            if field.options:
                options = json.loads(field.options)

            if item.value not in options:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Invalid value for '{field.name}'. "
                        f"Allowed values: {options}"
                    ),
                )

    # Fetch ALL configured fields so we can verify
    # that every required field is present.
    all_fields = db.query(FieldConfiguration).all()

    required_fields = [
        field
        for field in all_fields
        if field.required
    ]

    provided_field_ids = set(field_ids)

    missing_required_fields = [
        field.name
        for field in required_fields
        if field.id not in provided_field_ids
    ]

    if missing_required_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Missing required field(s): "
                f"{missing_required_fields}"
            ),
        )

    # Get existing values for this machine
    existing_values = {
        machine_value.field_id: machine_value
        for machine_value in db_machine.values
    }

    # Update existing values or create new ones
    for item in machine.values:
        field = fields_by_id[item.field_id]

        if field.id in existing_values:
            existing_values[field.id].value = item.value
        else:
            db_value = MachineValue(
                machine_id=db_machine.id,
                field_id=field.id,
                value=item.value,
            )

            db.add(db_value)

    db.commit()
    db.refresh(db_machine)

    # Build response from the updated machine
    response_values = []

    for machine_value in db_machine.values:
        response_values.append(
            {
                "field_id": machine_value.field_id,
                "field_name": machine_value.field.name,
                "value": machine_value.value,
            }
        )

    return MachineResponse(
        id=db_machine.id,
        values=response_values,
    )