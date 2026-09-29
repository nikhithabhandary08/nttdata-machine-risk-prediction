import { useEffect, useState } from "react";
import { getMachines, predictMachineRisk } from "../services/api";

function RiskPrediction() {
  const [machines, setMachines] = useState([]);
  const [selectedMachineId, setSelectedMachineId] = useState("");

  const [temperature, setTemperature] = useState("");
  const [pressure, setPressure] = useState("");
  const [vibration, setVibration] = useState("");

  const [lastPrediction, setLastPrediction] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMachines() {
      try {
        setLoadingMachines(true);

        const data = await getMachines();

        setMachines(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingMachines(false);
      }
    }

    loadMachines();
  }, []);

  function handleMachineChange(event) {
    const machineId = event.target.value;

    setSelectedMachineId(machineId);
    setLastPrediction(null);
    setError("");

    if (!machineId) {
      setTemperature("");
      setPressure("");
      setVibration("");
      return;
    }

    const machine = machines.find(
      (item) => String(item.id) === machineId
    );

    if (!machine) {
      return;
    }

    const values = {};

    machine.values.forEach((item) => {
      values[item.field_name] = item.value;
    });

    setTemperature(values.Temperature || "");
    setPressure(values.Pressure || "");
    setVibration(values.Vibration || "");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!selectedMachineId) {
      setError("Please select a machine.");
      return;
    }

    if (!temperature || !pressure || !vibration) {
      setError("The selected machine is missing prediction inputs.");
      return;
    }

    const selectedMachine = machines.find(
      (machine) => String(machine.id) === selectedMachineId
    );

    const machineNameValue = selectedMachine?.values.find(
      (item) => item.field_name === "Machine Name"
    );

    const machineName =
      machineNameValue?.value || `Machine ${selectedMachineId}`;

    const predictionInput = {
      temperature: Number(temperature),
      pressure: Number(pressure),
      vibration,
    };

    try {
      setLoading(true);

      const result = await predictMachineRisk(predictionInput);

      setLastPrediction({
        machineName,
        temperature: predictionInput.temperature,
        pressure: predictionInput.pressure,
        vibration: predictionInput.vibration,
        risk: result.risk,
      });

      setSelectedMachineId("");
      setTemperature("");
      setPressure("");
      setVibration("");
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
            Select a machine and predict its risk using the local
            Python machine learning model.
          </p>
        </div>
      </div>

      <div className="field-layout">
        <section className="module-card">
          <div className="card-header">
            <div>
              <h4>Prediction Inputs</h4>

              <p>
                Select a machine to load the conditions used by the
                current risk model.
              </p>
            </div>
          </div>

          <form
            className="field-form"
            onSubmit={handleSubmit}
          >
            <label>
              Select Machine

              <select
                value={selectedMachineId}
                onChange={handleMachineChange}
                disabled={loadingMachines}
              >
                <option value="">
                  {loadingMachines
                    ? "Loading machines..."
                    : "Select Machine"}
                </option>

                {machines.map((machine) => {
                  const machineName = machine.values.find(
                    (item) => item.field_name === "Machine Name"
                  );

                  return (
                    <option
                      key={machine.id}
                      value={machine.id}
                    >
                      {machineName?.value || `Machine ${machine.id}`}
                    </option>
                  );
                })}
              </select>
            </label>

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
              disabled={loading || loadingMachines}
            >
              {loading ? "Predicting..." : "Predict Risk"}
            </button>
          </form>
        </section>

        <section className="module-card">
          <div className="card-header">
            <div>
              <h4>Prediction Result</h4>

              <p>
                Result returned by the local Python ML model.
              </p>
            </div>
          </div>

          {lastPrediction ? (
            <div
              className={`prediction-result ${
                lastPrediction.risk
                  .toLowerCase()
                  .includes("high")
                  ? "risk-high"
                  : lastPrediction.risk
                      .toLowerCase()
                      .includes("medium")
                    ? "risk-medium"
                    : "risk-low"
              }`}
            >
              <div className="prediction-details">
                <div className="prediction-detail">
                  <span>Machine</span>
                  <strong>{lastPrediction.machineName}</strong>
                </div>

                <div className="prediction-detail">
                  <span>Temperature</span>
                  <strong>{lastPrediction.temperature}</strong>
                </div>

                <div className="prediction-detail">
                  <span>Pressure</span>
                  <strong>{lastPrediction.pressure}</strong>
                </div>

                <div className="prediction-detail">
                  <span>Vibration</span>
                  <strong>{lastPrediction.vibration}</strong>
                </div>
              </div>

              <div className="prediction-risk">
                <span className="prediction-label">
                  Predicted Risk
                </span>

                <strong>{lastPrediction.risk}</strong>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              Select a machine and run a prediction.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default RiskPrediction;