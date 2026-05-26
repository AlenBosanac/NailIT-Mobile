import { getProfile, getSchedule } from '@/services/profileService';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { Briefcase, Calendar, ChevronRight, LogOut, Mail, Phone, User, Wrench } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Tab = 'personal' | 'skills' | 'schedule';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  skills: string[];
  createdAt: string;
}

interface ScheduleItem {
  shiftStart: string;
  shiftEnd: string;
  siteName: string;
  notes?: string;
}

export default function ProfileScreen() {
  const { fullName, email, role, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('personal');

  const [profile, setProfile]     = useState<ProfileData | null>(null);
  const [schedule, setSchedule]   = useState<ScheduleItem[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
  setLoading(true);
  try {
    const [profileData, scheduleData] = await Promise.all([
      getProfile(),
      getSchedule(),
    ]);
    setProfile(profileData);
    setSchedule(scheduleData);
  } catch (e) {
    console.error('Profile fetch error:', e);
  } finally {
    setLoading(false);
  }
};

  const handleLogout = () => {
    logout();
    router.replace('/login' as any);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('hr-HR', { weekday: 'long', day: '2-digit', month: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {fullName?.split(' ').map(n => n[0]).join('').toUpperCase() ?? 'RW'}
          </Text>
        </View>
        <Text style={styles.name}>{fullName ?? 'Radnik'}</Text>
        <Text style={styles.role}>{role ?? 'Radnik'}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['personal', 'skills', 'schedule'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            {tab === 'personal'   && <User     size={16} color={activeTab === tab ? '#FF6B35' : '#999'} />}
            {tab === 'skills' && <Wrench   size={16} color={activeTab === tab ? '#FF6B35' : '#999'} />}
            {tab === 'schedule' && <Calendar size={16} color={activeTab === tab ? '#FF6B35' : '#999'} />}
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab === 'personal' ? 'Personal' : tab === 'skills' ? 'Skills' : 'Schedule'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>

          {/* PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <View>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <InfoRow icon={<User     size={18} color="#FF6B35" />} label="Name" value={profile?.fullName ?? fullName ?? '-'} />
              <InfoRow icon={<Mail     size={18} color="#FF6B35" />} label="Email"         value={profile?.email ?? email ?? '-'} />
              <InfoRow icon={<Phone    size={18} color="#FF6B35" />} label="Phone"       value={profile?.phone ?? '-'} />
              <InfoRow icon={<Briefcase size={18} color="#FF6B35" />} label="Position"    value={profile?.role ?? role ?? '-'} />
              <InfoRow icon={<Calendar size={18} color="#FF6B35" />} label="Hired Date"  value={profile?.createdAt ? formatDate(profile.createdAt) : '-'} />

              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <LogOut size={18} color="#fff" />
                <Text style={styles.logoutText}>Odjavi se</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* VJEŠTINE */}
          {activeTab === 'skills' && (
            <View>
              <Text style={styles.sectionTitle}>Skills and Competencies</Text>
              {profile?.skills && profile.skills.length > 0 ? (
                <View style={styles.skillsGrid}>
                  {profile.skills.map((skill, i) => (
                    <View key={i} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Wrench size={40} color="#ddd" />
                  <Text style={styles.emptyText}>No skills added</Text>
                  <Text style={styles.emptySubText}>Contact your site manager</Text>
                </View>
              )}
            </View>
          )}

        {/* RASPORED */}
{activeTab === 'schedule' && (
  <View>
    <Text style={styles.sectionTitle}>Schedule</Text>
    {schedule.length > 0 ? (
      schedule.map((item, i) => (
        <View key={i} style={styles.dayRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dayName}>
              {new Date(item.shiftStart).toLocaleDateString('hr-HR', {
                weekday: 'long', day: '2-digit', month: '2-digit'
              })}
            </Text>
            <Text style={styles.daySite}>{item.siteName}</Text>
            {item.notes && <Text style={styles.dayNotes}>{item.notes}</Text>}
          </View>
          <Text style={styles.dayHours}>
            {new Date(item.shiftStart).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
            {' – '}
            {new Date(item.shiftEnd).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      ))
    ) : (
      <View style={styles.emptyState}>
        <Calendar size={40} color="#ddd" />
        <Text style={styles.emptyText}>No schedule available</Text>
        <Text style={styles.emptySubText}>Schedule has not been assigned yet</Text>
      </View>
    )}
  </View>
)}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* ─── InfoRow ────────────────────────────── */
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      <ChevronRight size={16} color="#ccc" />
    </View>
  );
}

/* ─── Styles ─────────────────────────────── */
const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F5F5F5' },
  loader:          { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header:          { backgroundColor: '#1A1A1A', alignItems: 'center', paddingVertical: 28, paddingTop: 48 },
  avatarCircle:    { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText:      { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  name:            { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  role:            { color: '#aaa', fontSize: 13, marginTop: 2 },

  tabBar:          { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab:             { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 12 },
  tabActive:       { borderBottomWidth: 2, borderBottomColor: '#FF6B35' },
  tabLabel:        { fontSize: 13, color: '#999', fontWeight: '500' },
  tabLabelActive:  { color: '#FF6B35', fontWeight: '700' },

  content:         { padding: 16, paddingBottom: 32 },
  sectionTitle:    { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },

  infoRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, gap: 12 },
  infoIcon:        { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF0EA', alignItems: 'center', justifyContent: 'center' },
  infoText:        { flex: 1 },
  infoLabel:       { fontSize: 11, color: '#999', marginBottom: 2 },
  infoValue:       { fontSize: 14, color: '#1A1A1A', fontWeight: '600' },

  skillsGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillTag:        { backgroundColor: '#FFF0EA', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#FFD5C2' },
  skillText:       { color: '#FF6B35', fontWeight: '600', fontSize: 13 },

  dayRow:          { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dayName:         { fontSize: 13, fontWeight: '700', color: '#1A1A1A', textTransform: 'capitalize' },
  daySite:         { fontSize: 12, color: '#666', marginTop: 2 },
  dayHours:        { fontSize: 13, fontWeight: '600', color: '#FF6B35' },
  dayNotes: { fontSize: 11, color: '#aaa', marginTop: 2, fontStyle: 'italic' },

  emptyState:      { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyText:       { fontSize: 16, fontWeight: '600', color: '#aaa' },
  emptySubText:    { fontSize: 13, color: '#ccc' },

  logoutBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FF3B30', borderRadius: 12, padding: 14, marginTop: 24 },
  logoutText:      { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});