
/**
 * API service for the Property Violations Finder app
 * This file exports functions to interact with the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }
  return response.json();
}

// Addresses API
export async function fetchAddresses(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/addresses`);
  return handleResponse<string[]>(response);
}

export async function saveAddress(address: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  return handleResponse<string[]>(response);
}

export async function removeAddress(index: number): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/addresses/${index}`, {
    method: 'DELETE'
  });
  return handleResponse<string[]>(response);
}

export async function bulkImportAddresses(addresses: string[]): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/addresses/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addresses })
  });
  return handleResponse<string[]>(response);
}

// Violations API
export async function searchViolations(address: string, signal?: AbortSignal): Promise<any[]> {
  const params = new URLSearchParams({ address });
  const response = await fetch(`${API_BASE_URL}/violations/search?${params}`, {
    signal
  });
  return handleResponse<any[]>(response);
}

export async function searchMultipleAddresses(addresses: string[], year?: number): Promise<any[]> {
  const params = new URLSearchParams();
  if (year) params.append('year', year.toString());
  
  const response = await fetch(`${API_BASE_URL}/violations/search-multiple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addresses }),
    signal: undefined // This could be modified to support abortion
  });
  return handleResponse<any[]>(response);
}

// Settings API
export async function fetchSettings(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/settings`);
  return handleResponse<any>(response);
}

export async function saveSettings(settings: any): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  return handleResponse<boolean>(response);
}
