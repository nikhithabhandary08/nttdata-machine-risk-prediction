import { useEffect, useState } from "react";
import { createField, getFields } from "../services/api";

function FieldConfiguration() {
  const [fields, setFields] = useState([]);

  const [name, setName] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadFields() {
    try {
      setLoading(true);
      setError("");

      const data = await getFields();
      setFields(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFields();
  }, []);

  function resetForm() {
    setName("");
    setFieldType("text");
    setRequired(false);
    setOptions("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const fieldData = {
      name: name.trim(),
      field_type: fieldType,
      required,
      options:
        fieldType === "dropdown"
          ? options
              .split(",")
              .map((option) => option.trim())
              .filter(Boolean)
          : null,
    };

    if (!fieldData.name) {
      setError("Field name is required.");
      return;
    }

    if (
      fieldType === "dropdown" &&
      fieldData.options.length === 0
    ) {
      setError("Dropdown fields require at least one option.");
      return;
    }

    try {
      setSubmitting(true);

      await createField(fieldData);

      setSuccess("Field created successfully.");
      resetForm();

      await loadFields();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="module-page">
      <div className="module-header">
        <div>
          <p className="eyebrow">CONFIGURATION</p>
          <h3>Field Configuration</h3>
          <p>
            Create dynamic fields that can be used in machine records.
          </p>
        </div>
      </div>

      <div className="field-layout">
        <section className="module-card">
          <div className="card-header">
            <div>
              <h4>Add New Field</h4>
              <p>
                Define the name, type, and validation rules.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="field-form">
            <label>
              Field Name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Humidity"
              />
            </label>

            <label>
              Field Type
              <select
                value={fieldType}
                onChange={(event) => setFieldType(event.target.value)}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="dropdown">Dropdown</option>
              </select>
            </label>

            {fieldType === "dropdown" && (
              <label>
                Dropdown Options
                <input
                  type="text"
                  value={options}
                  onChange={(event) => setOptions(event.target.value)}
                  placeholder="Low, Medium, High"
                />
                <span className="input-help">
                  Separate options with commas.
                </span>
              </label>
            )}

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={required}
                onChange={(event) => setRequired(event.target.checked)}
              />
              <span>Required field</span>
            </label>

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
              {submitting ? "Creating..." : "Create Field"}
            </button>
          </form>
        </section>

        <section className="module-card">
          <div className="card-header">
            <div>
              <h4>Configured Fields</h4>
              <p>
                Fields currently available for machine records.
              </p>
            </div>

            <span className="count-badge">
              {fields.length}
            </span>
          </div>

          {loading ? (
            <div className="empty-state">
              Loading fields...
            </div>
          ) : fields.length === 0 ? (
            <div className="empty-state">
              No fields configured.
            </div>
          ) : (
            <div className="field-list">
              {fields.map((field) => (
                <div className="field-item" key={field.id}>
                  <div>
                    <strong>{field.name}</strong>

                    <div className="field-meta">
                      <span className="type-badge">
                        {field.field_type}
                      </span>

                      <span>
                        {field.required ? "Required" : "Optional"}
                      </span>
                    </div>

                    {field.field_type === "dropdown" &&
                      field.options && (
                        <div className="options-list">
                          Options: {field.options.join(", ")}
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default FieldConfiguration;