import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { createIncident, getIncidents, Incident, IncidentCategory, IncidentPriority } from '../../services/incidentService';
import { useAuthStore } from '../../store/authStore';

const priorityColor: Record<string, string> = {
  Low: '#4CAF50', Medium: '#FF9800', High: '#F44336', Critical: '#9C27B0',
};

const statusLabel: Record<string, string> = {
  Open: 'Otvoreno', InProgress: 'U obradi', Closed: 'Zatvoreno',
};

const categories: IncidentCategory[] = ['Safety', 'Equipment', 'Material', 'Other'];
const priorities: IncidentPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export default function IncidentsScreen() {
  const { siteId } = useAuthStore();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IncidentCategory>('Other');
  const [priority, setPriority] = useState<IncidentPriority>('Medium');

  useEffect(() => { fetchIncidents(); }, []);

  const fetchIncidents = async () => {
    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch {
      Alert.alert('Greška', 'Nije moguće dohvatiti incidente.');
    } finally {
      setLoading(false);
    }
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Greška', 'Potrebna je dozvola za galeriju.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Greška', 'Potrebna je dozvola za kameru.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Greška', 'Naslov i opis su obavezni.');
      return;
    }
    if (!siteId) {
      Alert.alert('Greška', 'Nije pronađeno gradilište.');
      return;
    }
    setSubmitting(true);
    try {
      await createIncident({ siteId, title, description, category, priority });
      Alert.alert('Uspjeh', '✅ Incident prijavljen!');
      setModalVisible(false);
      setTitle(''); setDescription(''); setPhoto(null);
      setCategory('Other'); setPriority('Medium');
      fetchIncidents();
    } catch {
      Alert.alert('Greška', 'Nije moguće prijaviti incident.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#FF6B35" />;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Incidenti</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Prijavi</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={incidents}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Nema prijavljenih incidenata.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={[styles.badge, { backgroundColor: priorityColor[item.priority] }]}>
                <Text style={styles.badgeText}>{item.priority}</Text>
              </View>
            </View>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.meta}>📍 {item.siteName}</Text>
              <Text style={styles.meta}>{statusLabel[item.status]}</Text>
            </View>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('hr-HR')}</Text>
          </View>
        )}
      />

      {/* Modal za prijavu incidenta */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalHeader}>Prijava incidenta</Text>

          <Text style={styles.label}>Naslov *</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Kratki opis incidenta" />

          <Text style={styles.label}>Opis *</Text>
          <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} placeholder="Detaljni opis..." multiline numberOfLines={4} />

          <Text style={styles.label}>Kategorija</Text>
          <View style={styles.optionRow}>
            {categories.map(c => (
              <TouchableOpacity key={c} style={[styles.option, category === c && styles.optionActive]} onPress={() => setCategory(c)}>
                <Text style={[styles.optionText, category === c && styles.optionTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Prioritet</Text>
          <View style={styles.optionRow}>
            {priorities.map(p => (
              <TouchableOpacity key={p} style={[styles.option, priority === p && { backgroundColor: priorityColor[p], borderColor: priorityColor[p] }]} onPress={() => setPriority(p)}>
                <Text style={[styles.optionText, priority === p && styles.optionTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Foto-dokumentacija</Text>
          <View style={styles.photoRow}>
            <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
              <Text style={styles.photoBtnText}>📷 Kamera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
              <Text style={styles.photoBtnText}>🖼️ Galerija</Text>
            </TouchableOpacity>
          </View>
          {photo && <Text style={styles.photoAdded}>✅ Fotografija dodana</Text>}

          <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Prijavi incident</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelBtnText}>Odustani</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  addBtn: { backgroundColor: '#FF6B35', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '600', flex: 1, color: '#1A1A1A' },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 8 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  description: { color: '#666', fontSize: 14, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { color: '#888', fontSize: 13 },
  date: { color: '#bbb', fontSize: 12, marginTop: 4 },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
  modal: { flex: 1, padding: 24, backgroundColor: '#fff' },
  modalHeader: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, color: '#1A1A1A' },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#fafafa' },
  textarea: { height: 100, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  optionActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  optionText: { fontSize: 13, color: '#555' },
  optionTextActive: { color: '#fff', fontWeight: '600' },
  photoRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  photoBtn: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, alignItems: 'center' },
  photoBtnText: { fontSize: 14, color: '#555' },
  photoAdded: { color: '#4CAF50', marginTop: 8, fontSize: 13 },
  submitBtn: { backgroundColor: '#FF6B35', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 32 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { alignItems: 'center', padding: 16, marginTop: 8, marginBottom: 40 },
  cancelBtnText: { color: '#888', fontSize: 15 },
});