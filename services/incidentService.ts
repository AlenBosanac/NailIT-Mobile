import api from './api';

export type IncidentCategory = 'Safety' | 'Equipment' | 'Material' | 'Other';
export type IncidentPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Open' | 'InProgress' | 'Closed';

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  priority: IncidentPriority;
  status: IncidentStatus;
  siteId: string;
  siteName: string;
  reportedById: string;
  reporter: string;
  createdAt: string;
}

export interface CreateIncidentData {
  siteId: string;
  title: string;
  description: string;
  category: IncidentCategory;
  priority: IncidentPriority;
}

export const getIncidents = async (): Promise<Incident[]> => {
  const response = await api.get('/api/incidents');
  return response.data;
};

export const createIncident = async (data: CreateIncidentData): Promise<void> => {
  await api.post('/api/incidents', data);
};