// API service to route calls through your backend at localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
  async getProfiles(token: string) {
    const response = await fetch(`${API_BASE_URL}/profiles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch profiles');
    return response.json();
  },

  async getProfile(token: string) {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  async getInvoices(token: string, status?: string) {
    const url = status 
      ? `${API_BASE_URL}/invoices?status=${status}`
      : `${API_BASE_URL}/invoices`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch invoices');
    return response.json();
  },

  // Plaid endpoints
  async createPlaidLinkToken(token: string) {
    const response = await fetch(`${API_BASE_URL}/plaid/create-link-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to create link token');
    return response.json();
  },

  async exchangePlaidToken(token: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/plaid/exchange-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to exchange token');
    return response.json();
  },
};
