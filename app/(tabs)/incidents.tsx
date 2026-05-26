import {
    createIncident,
    getIncidents,
    Incident, IncidentCategory, IncidentPriority,
    uploadIncidentPhoto,
} from '@/services/incidentService';
import { useAuthStore } from '@/store/authStore';
import * as ImagePicker from 'expo-image-picker';
import { AlertTriangle, Camera, Plus, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const KATEGORIJE: IncidentCategory[] = ['Safety', 'Equipment', 'Material', 'Other'];
const PRIORITETI: IncidentPriority[] = ['Low', 'Medium', 'High', 'Critical'];

const kategorijaLabel: Record<IncidentCategory, string> = {
  Safety: 'Safety', Equipment: 'Equipment', Material: 'Material', Other: 'Other',
};
const prioritetLabel: Record<IncidentPriority, string> = {
  Low: 'Low', Medium: 'Medium', High: 'High', Critical: 'Critical',
};
const prioritetBoja: Record<IncidentPriority, string> = {
  Low: '#4CAF50', Medium: '#FF9800', High: '#FF6B35', Critical: '#F44336',
};
const statusLabel: Record<string, string> = {
  Open: 'Open', InReview: 'In Review', Closed: 'Closed',
};

export default function IncidentsScreen() {
  const { siteId } = useAuthStore();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Forma
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]     = useState<IncidentCategory>('Safety');
  const [priority, setPriority]     = useState<IncidentPriority>('Medium');
  const [photos, setPhotos]         = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchIncidents(); }, []);

  const fetchIncidents = async () => {
    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch {
      Alert.alert('Error', 'Unable to fetch incidents.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Permission to access media library is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos(prev => [...prev, result.assets[0].uri]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Permission to access camera is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos(prev => [...prev, result.assets[0].uri]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim())       { Alert.alert('Error', 'Please enter a title.'); return; }
    if (!description.trim()) { Alert.alert('Error', 'Please enter a description.'); return; }
    if (!siteId)             { Alert.alert('Error', 'You are not assigned to a construction site.'); return; }

    setSubmitting(true);
    try {
      const { id } = await createIncident({ siteId, title, description, category, priority });

      for (const uri of photos) {
        try { await uploadIncidentPhoto(id, uri); }
        catch { }
      }

      Alert.alert('Success', ' Incident reported!');
      resetForma();
      setModalVisible(false);
      fetchIncidents();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Error occurred while submitting incident.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForma = () => {
    setTitle(''); setDescription('');
    setCategory('Safety'); setPriority('Medium');
    setPhotos([]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#FF6B35" />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Incidents</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={incidents}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchIncidents(); }} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <AlertTriangle size={40} color="#ddd" />
            <Text style={styles.emptyText}>No incidents reported</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: prioritetBoja[item.priority] }]}>
                <Text style={styles.priorityText}>{prioritetLabel[item.priority]}</Text>
              </View>
            </View>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.cardMeta}>
              <Text style={styles.metaText}>📍 {item.siteName}</Text>
              <Text style={styles.metaText}>🗂 {kategorijaLabel[item.category]}</Text>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.statusText}>{statusLabel[item.status]}</Text>
              <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString('hr-HR')}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Modal — forma */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Report Incident</Text>
            <TouchableOpacity onPress={() => { resetForma(); setModalVisible(false); }}>
              <X size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>

            {/* Naslov */}
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Short description of the incident"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#aaa"
            />

            {/* Opis */}
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Detaljan opis što se dogodilo..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor="#aaa"
            />

            {/* Kategorija */}
            <Text style={styles.label}>Category</Text>
            <View style={styles.chipRow}>
              {KATEGORIJE.map(k => (
                <TouchableOpacity
                  key={k}
                  style={[styles.chip, category === k && styles.chipActive]}
                  onPress={() => setCategory(k)}
                >
                  <Text style={[styles.chipText, category === k && styles.chipTextActive]}>
                    {kategorijaLabel[k]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Prioritet */}
            <Text style={styles.label}>Priority</Text>
            <View style={styles.chipRow}>
              {PRIORITETI.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, priority === p && { backgroundColor: prioritetBoja[p], borderColor: prioritetBoja[p] }]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[styles.chipText, priority === p && { color: '#fff' }]}>
                    {prioritetLabel[p]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Fotografije */}
            <Text style={styles.label}>Photos</Text>
            <View style={styles.photoRow}>
              {photos.map((uri, i) => (
                <View key={i} style={styles.photoThumb}>
                  <Image source={{ uri }} style={styles.thumbImg} />
                  <TouchableOpacity
                    style={styles.removePhoto}
                    onPress={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                  >
                    <X size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                <Camera size={22} color="#FF6B35" />
                <Text style={styles.photoBtnText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
                <Text style={styles.photoBtnText}>Gallery</Text>
              </TouchableOpacity>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitText}>Report Incident</Text>
              }
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F5F5F5' },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle:    { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  addBtn:         { backgroundColor: '#FF6B35', borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  card:           { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 2 },
  cardTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardTitle:      { fontSize: 15, fontWeight: '700', color: '#1A1A1A', flex: 1, marginRight: 8 },
  priorityBadge:  { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  priorityText:   { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardDesc:       { fontSize: 13, color: '#666', marginBottom: 8 },
  cardMeta:       { flexDirection: 'row', gap: 12, marginBottom: 8 },
  metaText:       { fontSize: 12, color: '#888' },
  cardFooter:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8 },
  statusText:     { fontSize: 12, color: '#555', fontWeight: '600' },
  dateText:       { fontSize: 12, color: '#aaa' },

  emptyState:     { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText:      { fontSize: 15, color: '#aaa' },

  // Modal
  modal:          { flex: 1, backgroundColor: '#F5F5F5' },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle:     { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  modalContent:   { padding: 16, paddingBottom: 40 },

  label:          { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 14 },
  input:          { backgroundColor: '#fff', borderRadius: 10, padding: 14, fontSize: 14, color: '#1A1A1A', borderWidth: 1, borderColor: '#e0e0e0' },
  textarea:       { height: 100, textAlignVertical: 'top' },

  chipRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:           { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  chipActive:     { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  chipText:       { fontSize: 13, color: '#555', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },

  photoRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  photoBtn:       { width: 80, height: 80, borderRadius: 10, borderWidth: 1.5, borderColor: '#FF6B35', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  photoBtnText:   { fontSize: 11, color: '#FF6B35', fontWeight: '600' },
  photoThumb:     { width: 80, height: 80, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  thumbImg:       { width: '100%', height: '100%' },
  removePhoto:    { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, padding: 3 },

  submitBtn:      { backgroundColor: '#FF6B35', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  btnDisabled:    { opacity: 0.6 },
  submitText:     { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});