/**
 * Servicios HTTP para comunicación del Frontend con la API REST de WebCreator AI.
 */

const API_BASE_URL = 'http://localhost:5001/api';

export async function createProject(userSessionId) {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user_session_id: userSessionId })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error al crear proyecto: ${response.status}`);
  }

  return response.json();
}

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
    const errorMsg = typeof errorData.error === 'string'
      ? errorData.error
      : (errorData.issues ? JSON.stringify(errorData.issues) : `Error en el chat: ${response.status}`);
    throw new Error(errorMsg);
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

export async function generatePrototype(projectId, options = {}) {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/generate-prototype`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(options)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error al generar prototipo: ${response.status}`);
  }

  return response.json();
}

