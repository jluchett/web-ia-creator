/**
 * Servicios HTTP para comunicación del Frontend con la API REST de WebCreator AI.
 */

const API_BASE_URL = '/api';

export async function sendChatMessage(projectId, message) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error en el chat: ${response.status}`);
  }

  return response.json();
}

export async function updateProjectMasterJson(projectId, masterJsonPatch) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/master-json`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(masterJsonPatch)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error al actualizar master_json: ${response.status}`);
  }

  return response.json();
}

export async function fetchLogoOptions(projectId, params = {}) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/logo-options`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error al obtener logos: ${response.status}`);
  }

  return response.json();
}

export async function unlockProjectLead(projectId, leadData) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/unlock-lead`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(leadData)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error al desbloquear lead: ${response.status}`);
  }

  return response.json();
}
