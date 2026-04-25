
import { User } from '../types';

interface AuthResponse {
  user: User;
  token: string;
}

const parseResponse = async (res: Response): Promise<AuthResponse> => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || 'Authentication failed.');
  }
  return data as AuthResponse;
};

export const authenticateUser = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  return parseResponse(response);
};

export const registerUser = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  });

  return parseResponse(response);
};

export const updateUserProfile = async (userData: { name: string; email: string; photoUrl?: string | null; theme?: string }, token: string): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });

  return parseResponse(response);
};
