import api from '@/services/api';
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

type Tab = 'osobni' | 'vjestine' | 'raspored';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  skills: string[];
  createdAt: string;
}

interface ScheduleItem {
  date: string;
  startTime: string;
  endTime: string;
  siteName: string;
}

export default function ProfileScreen() {
  const { fullName, email, role, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('osobni');

  const [profile, setProfile]     = useState<ProfileData | null>(null);
  const [schedule, setSchedule]   = useState<ScheduleItem[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profileRes, scheduleRes] = await Promise.all([
        api.get('/api/profile'),
        api.get('/api/profile/schedule'),
      ]);
      setProfile(profileRes.data);
      setSchedule(scheduleRes.data);
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
        {(['osobni', 'vjestine', 'raspored'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            {tab === 'osobni'   && <User     size={16} color={activeTab === tab ? '#FF6B35' : '#999'} />}
            {tab === 'vjestine' && <Wrench   size={16} color={activeTab === tab ? '#FF6B35' : '#999'} />}
            {tab === 'raspored' && <Calendar size={16} color={activeTab === tab ? '#FF6B35' : '#999'} />}
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab === 'osobni' ? 'Osobni' : tab === 'vjestine' ? 'Vještine' : 'Raspored'}
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

          {/* OSOBNI PODACI */}
          {activeTab === 'osobni' && (
            <View>
              <Text style={styles.sectionTitle}>Osobni podaci</Text>
              <InfoRow icon={<User     size={18} color="#FF6B35" />} label="Ime i prezime" value={profile?.fullName ?? fullName ?? '-'} />
              <InfoRow icon={<Mail     size={18} color="#FF6B35" />} label="Email"         value={profile?.email ?? email ?? '-'} />
              <InfoRow icon={<Phone    size={18} color="#FF6B35" />} label="Telefon"       value={profile?.phone ?? '-'} />
              <InfoRow icon={<Briefcase size={18} color="#FF6B35" />} label="Pozicija"    value={profile?.role ?? role ?? '-'} />
              <InfoRow icon={<Calendar size={18} color="#FF6B35" />} label="Zaposlen od"  value={profile?.createdAt ? formatDate(profile.createdAt) : '-'} />

              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <LogOut size={18} color="#fff" />
                <Text style={styles.logoutText}>Odjavi se</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* VJEŠTINE */}
          {activeTab === 'vjestine' && (
            <View>
              <Text style={styles.sectionTitle}>Vještine i kompetencije</Text>
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
                  <Text style={styles.emptyText}>Nema dodanih vještina</Text>
                  <Text style={styles.emptySubText}>Kontaktirajte voditelja gradilišta</Text>
                </View>
              )}
            </View>
          )}

          {/* RASPORED */}
          {activeTab === 'raspored' && (
            <View>
              <Text style={styles.sectionTitle}>Raspored</Text>
              {schedule.length > 0 ? (
                schedule.map((item, i) => (
                  <View key={i} style={styles.dayRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dayName}>{formatDay(item.date)}</Text>
                      <Text style={styles.daySite}>{item.siteName}</Text>
                    </View>
                    <Text style={styles.dayHours}>
                      {item.startTime.slice(0, 5)} – {item.endTime.slice(0, 5)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Calendar size={40} color="#ddd" />
                  <Text style={styles.emptyText}>Nema rasporeda</Text>
                  <Text style={styles.emptySubText}>Raspored još nije dodijeljen</Text>
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

  emptyState:      { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyText:       { fontSize: 16, fontWeight: '600', color: '#aaa' },
  emptySubText:    { fontSize: 13, color: '#ccc' },

  logoutBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FF3B30', borderRadius: 12, padding: 14, marginTop: 24 },
  logoutText:      { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});