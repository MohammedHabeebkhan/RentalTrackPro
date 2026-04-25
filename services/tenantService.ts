
import { Tenant } from '../types';

const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('prop_track_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

const parseResponse = async <T>(res: Response): Promise<T> => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Tenant request failed.');
  }
  return data as T;
};

export const fetchTenants = async (): Promise<Tenant[]> => {
  const response = await fetch('/api/tenants', {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return parseResponse<Tenant[]>(response);
};

export const saveTenantToDB = async (tenantData: Omit<Tenant, 'id'>): Promise<Tenant> => {
  const response = await fetch('/api/tenants', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(tenantData)
  });
  return parseResponse<Tenant>(response);
};

export const updateTenantInDB = async (id: string, tenantData: Partial<Tenant>): Promise<Tenant> => {
  const response = await fetch(`/api/tenants/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(tenantData)
  });
  return parseResponse<Tenant>(response);
};
