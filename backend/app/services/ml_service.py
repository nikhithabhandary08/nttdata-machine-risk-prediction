import json
import subprocess
from pathlib import Path


# Project root:
# nttdata-machine-risk-prediction/
PROJECT_ROOT = Path(__file__).resolve().parents[3]

# ML directory:
# nttdata-machine-risk-prediction/ml/
ML_DIR = PROJECT_ROOT / "ml"

# ML virtual environment Python executable
ML_PYTHON = ML_DIR / ".venv" / "Scripts" / "python.exe"

# ML prediction script
ML_SCRIPT = ML_DIR / "predict_cli.py"


def predict_machine_risk(
    temperature: float,
    pressure: float,
    vibration: str,
) -> str:
    """
    Run the local ML prediction process and return the risk result.
    """

    input_data = {
        "temperature": temperature,
        "pressure": pressure,
        "vibration": vibration,
    }

    result = subprocess.run(
        [
            str(ML_PYTHON),
            str(ML_SCRIPT),
        ],
        input=json.dumps(input_data),
        capture_output=True,
        text=True,
        timeout=10,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"ML prediction failed: {result.stderr.strip()}"
        )

    try:
        output = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "ML process returned invalid JSON."
        ) from exc

    if "risk" not in output:
        raise RuntimeError(
            "ML process response does not contain a risk result."
        )

    return output["risk"]