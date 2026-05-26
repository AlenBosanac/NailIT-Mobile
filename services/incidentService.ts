import api from './api';

export type IncidentCategory = 'Safety' | 'Equipment' | 'Material' | 'Other';
export type IncidentPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus   = 'Open' | 'InReview' | 'Closed';

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  priority: IncidentPriority;
  status: IncidentStatus;
  siteId: string;
  siteName: string;
  reporter: string;
  createdAt: string;
}

export const getIncidents = async (): Promise<Incident[]> => {
  const res = await api.get('/api/incidents');
  return res.data;
};

export const createIncident = async (data: {
  siteId: string;
  title: string;
  description: string;
  category: IncidentCategory;
  priority: IncidentPriority;
}): Promise<{ id: string }> => {
  const res = await api.post('/api/incidents', data);
  return res.data;
};

export const uploadIncidentPhoto = async (
  incidentId: string,
  uri: string
): Promise<{ id: string; url: string }> => {
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: `photo_${Date.now()}.jpg`,
    type: 'image/jpeg',
  } as any);

  const res = await api.post(`/api/photos/incident/${incidentId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};