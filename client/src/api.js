import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export async function getContacts(limit = 50) {
  const { data } = await api.get('/contacts', { params: { limit } });
  return data;
}

export async function generateContent(contact) {
  const { data } = await api.post('/ai/generate', { contact });
  return data;
}

export async function regenerateContent(contact) {
  const { data } = await api.post('/ai/regenerate', { contact });
  return data;
}

export async function logCall(callData) {
  const { data } = await api.post('/calls/log', callData);
  return data;
}

export async function getCallHistory(contactId) {
  const { data } = await api.get(`/calls/history/${contactId}`);
  return data;
}
