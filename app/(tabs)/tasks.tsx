import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTasks, Task, updateTaskStatus } from '../../services/taskService';

const priorityColor: Record<string, string> = {
  Low: '#4CAF50',
  Medium: '#FF9800',
  High: '#F44336',
};

const statusLabel: Record<string, string> = {
  NotStarted: 'Not Started',
  InProgress: 'In Progress',
  Completed: 'Completed',
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (e) {
      Alert.alert('Error', 'Unable to fetch tasks.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleComplete = async (task: Task) => {
    if (task.status === 'Completed') return;
    try {
      await updateTaskStatus(task.id, 'Completed');
      setTasks(prev => prev.map(t =>
        t.id === task.id ? { ...t, status: 'Completed' } : t
      ));
    } catch {
      Alert.alert('Error', 'Unable to update task status.');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#FF6B35" />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTasks(); }} />}
        ListEmptyComponent={<Text style={styles.empty}>No tasks assigned.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: priorityColor[item.priority] }]}>
                <Text style={styles.priorityText}>{item.priority}</Text>
              </View>
            </View>
            {item.description && <Text style={styles.description}>{item.description}</Text>}
            <Text style={styles.site}>📍 {item.siteName}</Text>
            {item.dueDate && (
              <Text style={styles.due}>📅 Rok: {new Date(item.dueDate).toLocaleDateString('hr-HR')}</Text>
            )}
            <View style={styles.cardFooter}>
              <Text style={styles.status}>{statusLabel[item.status]}</Text>
              {item.status !== 'Completed' && (
                <TouchableOpacity style={styles.completeBtn} onPress={() => handleComplete(item)}>
                  <Text style={styles.completeBtnText}>✓ Mark as Completed</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F5F5F5' },
  header:          { padding: 16, paddingTop: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle:     { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  card:            { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title:           { fontSize: 16, fontWeight: '600', flex: 1, color: '#1A1A1A' },
  priorityBadge:   { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, marginLeft: 8 },
  priorityText:    { color: '#fff', fontSize: 12, fontWeight: '600' },
  description:     { color: '#666', marginBottom: 8, fontSize: 14 },
  site:            { color: '#888', fontSize: 13, marginBottom: 4 },
  due:             { color: '#888', fontSize: 13, marginBottom: 8 },
  cardFooter:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  status:          { fontSize: 13, color: '#555' },
  completeBtn:     { backgroundColor: '#FF6B35', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  completeBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  empty:           { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
});