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

export async function getMachines() {
  const response = await fetch(`${API_BASE_URL}/machines/`);

  if (!response.ok) {
    throw new Error("Failed to fetch machine records.");
  }

  return response.json();
}

export async function createMachine(machineData) {
  const response = await fetch(`${API_BASE_URL}/machines/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(machineData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to create machine.");
  }

  return data;
}

export async function updateMachine(machineId, machineData) {
  const response = await fetch(
    `${API_BASE_URL}/machines/${machineId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(machineData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to update machine.");
  }

  return data;
}

export async function deleteMachine(machineId) {
  const response = await fetch(
    `${API_BASE_URL}/machines/${machineId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Failed to delete machine.");
  }
}


export async function predictMachineRisk(predictionData) {
  const response = await fetch(
    `${API_BASE_URL}/machines/predict`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(predictionData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Failed to predict machine risk."
    );
  }

  return data;
}

export async function deleteField(fieldId) {
  const response = await fetch(`${API_BASE_URL}/fields/${fieldId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Failed to delete field.");
  }
}