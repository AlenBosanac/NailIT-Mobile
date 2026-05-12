import api from './api';

export interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  skills: string[];
  createdAt: string;
}

export interface ScheduleItem {
  shiftStart: string;
  shiftEnd: string;
  siteName: string;
  notes?: string;
}

export interface SiteItem {
  siteId: string;
  siteName: string;
}

export const getProfile = async (): Promise<ProfileData> => {
  const res = await api.get('/api/profile');
  return res.data;
};

export const getSchedule = async (from?: string, to?: string): Promise<ScheduleItem[]> => {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to)   params.append('to', to);

  const res = await api.get(`/api/profile/schedule?${params.toString()}`);
  return res.data;
};

export const getSites = async (): Promise<SiteItem[]> => {
  const res = await api.get('/api/profile/sites');
  return res.data;
};

export const updatePhone = async (phone: string): Promise<void> => {
  await api.patch('/api/profile/phone', { phone });
};