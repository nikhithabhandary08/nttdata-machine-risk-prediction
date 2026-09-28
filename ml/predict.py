import joblib
import pandas as pd
from pathlib import Path


VIBRATION_MAPPING = {
    "Low": 0,
    "Medium": 1,
    "High": 2,
}


def predict_risk(
    temperature: float,
    pressure: float,
    vibration: str,
) -> str:
    """Predict machine risk using the trained local model."""

    if vibration not in VIBRATION_MAPPING:
        raise ValueError(
            "Vibration must be Low, Medium, or High."
        )

    model_path = Path(__file__).resolve().parent / "risk_model.joblib"

    model = joblib.load(model_path)

    input_data = pd.DataFrame(
        [
            {
                "temperature": temperature,
                "pressure": pressure,
                "vibration": VIBRATION_MAPPING[vibration],
            }
        ]
    )

    prediction = model.predict(input_data)

    return prediction[0]