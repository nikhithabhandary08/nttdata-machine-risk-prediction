const API_BASE_URL = "http://127.0.0.1:8000";

export async function getFields() {
  const response = await fetch(`${API_BASE_URL}/fields/`);

  if (!response.ok) {
    throw new Error("Failed to fetch field configurations.");
  }

  return response.json();
}

export async function createField(fieldData) {
  const response = await fetch(`${API_BASE_URL}/fields/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fieldData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create field.");
  }

  return data;
}