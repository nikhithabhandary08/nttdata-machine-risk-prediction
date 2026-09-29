import { useEffect, useState } from "react";
import {
  createMachine,
  deleteMachine,
  getFields,
  getMachines,
  updateMachine,
} from "../services/api";

function MachineRecords() {
  const [fields, setFields] = useState([]);
  const [machines, setMachines] = useState([]);
  const [machinesLoading, setMachinesLoading] = useState(true);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingMachineId, setEditingMachineId] = useState(null);

  async function loadFields() {
    try {
      setLoading(true);
      setError("");

      const data = await getFields();
      setFields(data);

      const initialValues = {};

      data.forEach((field) => {
        initialValues[field.id] = "";
      });

      setValues(initialValues);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMachines() {
    try {
      setMachinesLoading(true);

      const data = await getMachines();
      setMachines(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setMachinesLoading(false);
    }
  }

  useEffect(() => {
    loadFields();
    loadMachines();
  }, []);

  function handleChange(fieldId, value) {
    setValues((currentValues) => ({
      ...currentValues,
      [fieldId]: value,
    }));
  }

  function handleEdit(machine) {
    const existingValues = {};

    machine.values.forEach((item) => {
      existingValues[item.field_id] = item.value;
    });

    fields.forEach((field) => {
      if (!(field.id in existingValues)) {
        existingValues[field.id] = "";
      }
    });

    setValues(existingValues);
    setEditingMachineId(machine.id);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  async function handleDelete(machineId) {
  const confirmed = window.confirm(
    `Are you sure you want to delete Machine #${machineId}?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setError("");
    setSuccess("");

    await deleteMachine(machineId);

    setSuccess("Machine deleted successfully.");

    await loadMachines();

    if (editingMachineId === machineId) {
      cancelEdit();
    }
  } catch (err) {
    setError(err.message);
  }
}

  function cancelEdit() {
    const resetValues = {};

    fields.forEach((field) => {
      resetValues[field.id] = "";
    });

    setValues(resetValues);
    setEditingMachineId(null);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const machineData = {
      values: fields.map((field) => ({
        field_id: field.id,
        value: values[field.id] ?? "",
      })),
    };

    try {
      setSubmitting(true);

      if (editingMachineId) {
        await updateMachine(
          editingMachineId,
          machineData
        );

        setSuccess("Machine updated successfully.");
      } else {
        await createMachine(machineData);

        setSuccess("Machine created successfully.");
      }

      await loadMachines();

      const resetValues = {};

      fields.forEach((field) => {
        resetValues[field.id] = "";
      });

      setValues(resetValues);
      setEditingMachineId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="module-page">
        <div className="empty-state">
          Loading machine fields...
        </div>
      </div>
    );
  }

  if (error && fields.length === 0) {
    return (
      <div className="module-page">
        <div className="message error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="module-page">
      <div className="module-header">
        <div>
          <p className="eyebrow">
            MACHINE MANAGEMENT
          </p>

          <h3>Machine Records</h3>

          <p>
            Create and manage machine records using
            the configured dynamic fields.
          </p>
        </div>
      </div>

      {/* Machine Form */}
      <section className="module-card">
        <div className="card-header">
          <div>
            <h4>
              {editingMachineId
                ? `Edit Machine #${editingMachineId}`
                : "Machine Details"}
            </h4>

            <p>
              This form is generated from the current
              field configuration.
            </p>
          </div>
        </div>

        <form
          className="field-form"
          onSubmit={handleSubmit}
        >
          {fields.map((field) => (
            <label key={field.id}>
              {field.name}

              {field.field_type === "dropdown" ? (
                <select
                  value={values[field.id] || ""}
                  onChange={(event) =>
                    handleChange(
                      field.id,
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select {field.name}
                  </option>

                  {field.options?.map((option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={
                    field.field_type === "number"
                      ? "number"
                      : "text"
                  }
                  value={values[field.id] || ""}
                  onChange={(event) =>
                    handleChange(
                      field.id,
                      event.target.value
                    )
                  }
                  placeholder={`Enter ${field.name}`}
                />
              )}

              {field.required && (
                <span className="input-help">
                  Required field
                </span>
              )}
            </label>
          ))}

          {error && (
            <div className="message error">
              {error}
            </div>
          )}

          {success && (
            <div className="message success">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={submitting}
          >
            {submitting
              ? editingMachineId
                ? "Updating..."
                : "Creating..."
              : editingMachineId
                ? "Update Machine"
                : "Create Machine"}
          </button>

          {editingMachineId && (
            <button
              type="button"
              className="secondary-button"
              onClick={cancelEdit}
              disabled={submitting}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </section>

      {/* Saved Machine Records */}
      <section className="module-card">
        <div className="card-header">
          <div>
            <h4>Saved Machine Records</h4>

            <p>
              Machine records currently stored in
              the database.
            </p>
          </div>

          <span className="count-badge">
            {machines.length}
          </span>
        </div>

        {machinesLoading ? (
          <div className="empty-state">
            Loading machine records...
          </div>
        ) : machines.length === 0 ? (
          <div className="empty-state">
            No machine records found.
          </div>
        ) : (
          <div className="field-list">
            {machines.map((machine) => (
              <div
                className="field-item"
                key={machine.id}
              >
                <div>
                  <strong>
                    Machine #{machine.id}
                  </strong>

                  <div className="machine-actions">
                     <button
                      type="button"
                       className="secondary-button"
                    onClick={() =>
                    handleEdit(machine)
              }
                >
                 Edit
                </button>

                <button
                type="button"
                 className="secondary-button"
                 onClick={() =>
                 handleDelete(machine.id)
                }
                 >
                   Delete
                  </button>
              </div>
                  <div className="field-list">
                    {machine.values.map((item) => (
                      <div
                        className="field-meta"
                        key={item.field_id}
                      >
                        <span>
                          <strong>
                            {item.field_name}:
                          </strong>{" "}
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default MachineRecords;