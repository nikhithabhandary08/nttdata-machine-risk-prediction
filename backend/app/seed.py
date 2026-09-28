import json

from sqlalchemy.orm import Session

from .models import FieldConfiguration


INITIAL_FIELDS = [
    {
        "name": "Machine Name",
        "field_type": "text",
        "required": True,
        "options": None,
    },
    {
        "name": "Temperature",
        "field_type": "number",
        "required": True,
        "options": None,
    },
    {
        "name": "Pressure",
        "field_type": "number",
        "required": True,
        "options": None,
    },
    {
        "name": "Vibration",
        "field_type": "dropdown",
        "required": True,
        "options": ["Low", "Medium", "High"],
    },
]


def seed_initial_fields(db: Session):
    for field_data in INITIAL_FIELDS:
        existing_field = (
            db.query(FieldConfiguration)
            .filter(FieldConfiguration.name == field_data["name"])
            .first()
        )

        if existing_field:
            continue

        db_field = FieldConfiguration(
            name=field_data["name"],
            field_type=field_data["field_type"],
            required=field_data["required"],
            options=(
                json.dumps(field_data["options"])
                if field_data["options"]
                else None
            ),
        )

        db.add(db_field)

    db.commit()