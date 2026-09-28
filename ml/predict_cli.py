import json
import sys

from predict import predict_risk


def main():
    # Read JSON input from the backend process
    input_data = json.loads(sys.stdin.read())

    temperature = float(input_data["temperature"])
    pressure = float(input_data["pressure"])
    vibration = input_data["vibration"]

    # Run the existing ML prediction function
    risk = predict_risk(
        temperature=temperature,
        pressure=pressure,
        vibration=vibration,
    )

    # Return the prediction as JSON
    print(
        json.dumps(
            {
                "risk": risk
            }
        )
    )


if __name__ == "__main__":
    main()