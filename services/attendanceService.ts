import api from './api';

export interface AttendanceStatus {
  isCheckedIn: boolean;
  last: {
    type: string;
    recordedAt: string;
    geofenceValid: boolean;
  } | null;
}

export interface AttendanceResponse {
  id: string;
  geofenceValid: boolean;
  distanceMetres: number;
  geofenceRadius?: number;
}

export const getAttendanceStatus = async (siteId: string): Promise<AttendanceStatus> => {
  const response = await api.get(`/api/attendance/status?siteId=${siteId}`);
  return response.data;
};

export const checkIn = async (siteId: string, latitude: number, longitude: number): Promise<AttendanceResponse> => {
  const response = await api.post('/api/attendance/checkin', { siteId, latitude, longitude });
  return response.data;
};

export const checkOut = async (siteId: string, latitude: number, longitude: number): Promise<AttendanceResponse> => {
  const response = await api.post('/api/attendance/checkout', { siteId, latitude, longitude });
  return response.data;
};