import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert,
  StyleSheet,
  Text, TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { checkIn, checkOut, getAttendanceStatus } from '../../services/attendanceService';
import { useAuthStore } from '../../store/authStore';

export default function AttendanceScreen() {
  const { siteId } = useAuthStore();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [lastRecord, setLastRecord] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (siteId) {
      fetchStatus();
    } else {
      setLoading(false);
    }
  }, [siteId]);

  const fetchStatus = async () => {
    try {
      const status = await getAttendanceStatus(siteId!);
      setIsCheckedIn(status.isCheckedIn);
      if (status.last) {
        setLastRecord(new Date(status.last.recordedAt).toLocaleString('hr-HR'));
      }
    } catch {
      Alert.alert('Error', 'Unable to fetch attendance status.');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Permission to access location is required.');
      return null;
    }
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return location.coords;
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const coords = await getLocation();
      if (!coords || !siteId) return;
      const result = await checkIn(siteId, coords.latitude, coords.longitude);
      if (!result.geofenceValid) {
        Alert.alert('Outside Zone', `You are ${result.distanceMetres}m from the construction site. The maximum distance is ${result.geofenceRadius}m.`);
      } else {
        Alert.alert('Success', '✅ Check-in recorded!');
        setIsCheckedIn(true);
        setLastRecord(new Date().toLocaleString('hr-HR'));
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Error occurred while recording check-in.';
      Alert.alert('Error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const coords = await getLocation();
      if (!coords || !siteId) return;
      await checkOut(siteId, coords.latitude, coords.longitude);
      Alert.alert('Success', 'Checkout recorded!');
      setIsCheckedIn(false);
      setLastRecord(new Date().toLocaleString('hr-HR'));
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Error occurred while recording checkout.';
      Alert.alert('Error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#FF6B35" />;

  if (!siteId) return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Record</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.statusCard}>
          <Text style={styles.statusText}>You are not assigned to any construction site.</Text>
        </View>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Record</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.statusCard}>
          <View style={[styles.statusDot, { backgroundColor: isCheckedIn ? '#4CAF50' : '#F44336' }]} />
          <Text style={styles.statusText}>
            {isCheckedIn ? 'You are currently at the construction site' : 'You are not checked in at the construction site'}
          </Text>
        </View>

        {lastRecord && (
          <Text style={styles.lastRecord}>Last record: {lastRecord}</Text>
        )}

        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={[styles.btn, isCheckedIn ? styles.checkOutBtn : styles.checkInBtn, actionLoading && styles.btnDisabled]}
            onPress={isCheckedIn ? handleCheckOut : handleCheckIn}
            disabled={actionLoading}
          >
            {actionLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>{isCheckedIn ? 'Record checkout' : 'Record attendance'}</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          Attendance records are only possible when you are within the defined construction site zone.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F5F5F5' },
  header:       { padding: 16, paddingTop: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle:  { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  body:         { flex: 1, padding: 24 },
  statusCard:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  statusDot:    { width: 14, height: 14, borderRadius: 7, marginRight: 12 },
  statusText:   { fontSize: 16, fontWeight: '600', color: '#1A1A1A', flex: 1 },
  lastRecord:   { color: '#888', fontSize: 13, marginBottom: 32, textAlign: 'center' },
  btnContainer: { alignItems: 'center', marginTop: 16 },
  btn:          { width: '100%', borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  checkInBtn:   { backgroundColor: '#4CAF50' },
  checkOutBtn:  { backgroundColor: '#F44336' },
  btnDisabled:  { opacity: 0.6 },
  btnText:      { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  note:         { color: '#999', fontSize: 13, textAlign: 'center', marginTop: 32, lineHeight: 20 },
});