import { useState } from "react";
import { predictMachineRisk } from "../services/api";

function RiskPrediction() {
  const [temperature, setTemperature] = useState("");
  const [pressure, setPressure] = useState("");
  const [vibration, setVibration] = useState("");

  const [risk, setRisk] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setRisk("");

    if (!temperature || !pressure || !vibration) {
      setError("Please provide all prediction inputs.");
      return;
    }

    try {
      setLoading(true);

      const result = await predictMachineRisk({
        temperature: Number(temperature),
        pressure: Number(pressure),
        vibration,
      });

      setRisk(result.risk);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="module-page">
      <div className="module-header">
        <div>
          <p className="eyebrow">LOCAL MACHINE INTELLIGENCE</p>

          <h3>Risk Prediction</h3>

          <p>
            Predict machine risk using the local Python
            machine learning model.
          </p>
        </div>
      </div>

      <div className="field-layout">
        <section className="module-card">
          <div className="card-header">
            <div>
              <h4>Prediction Inputs</h4>

              <p>
                Enter the machine conditions used by the
                current risk model.
              </p>
            </div>
          </div>

          <form
            className="field-form"
            onSubmit={handleSubmit}
          >
            <label>
              Temperature

              <input
                type="number"
                value={temperature}
                onChange={(event) =>
                  setTemperature(event.target.value)
                }
                placeholder="e.g. 85"
              />
            </label>

            <label>
              Pressure

              <input
                type="number"
                value={pressure}
                onChange={(event) =>
                  setPressure(event.target.value)
                }
                placeholder="e.g. 120"
              />
            </label>

            <label>
              Vibration

              <select
                value={vibration}
                onChange={(event) =>
                  setVibration(event.target.value)
                }
              >
                <option value="">
                  Select Vibration
                </option>

                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>

            {error && (
              <div className="message error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Predicting..."
                : "Predict Risk"}
            </button>
          </form>
        </section>

        <section className="module-card">
          <div className="card-header">
            <div>
              <h4>Prediction Result</h4>

              <p>
                Result returned by the local Python ML
                model.
              </p>
            </div>
          </div>
{risk ? (
  <div
    className={`prediction-result ${
      risk.toLowerCase().includes("high")
        ? "risk-high"
        : risk.toLowerCase().includes("medium")
          ? "risk-medium"
          : "risk-low"
    }`}
  >
    <span className="prediction-label">
      Predicted Risk
    </span>

    <strong>{risk}</strong>
  </div>
) : (
  <div className="empty-state">
    Enter machine values and run a prediction.
  </div>
)}
        </section>
      </div>
    </div>
  );
}

export default RiskPrediction;