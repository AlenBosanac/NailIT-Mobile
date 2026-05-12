import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const { setAuth, setSiteId } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert('Greška', 'Unesite email i lozinku.');
    return;
  }
  setLoading(true);
  try {
    const response = await api.post('/api/auth/login', { email, password });
    const { fullName, email: userEmail, role } = response.data;
    setAuth(fullName, userEmail, role);

    // Postavi siteId
    const sitesRes = await api.get('/api/profile/sites');
    if (sitesRes.data?.length > 0) {
      setSiteId(sitesRes.data[0].siteId);
    }

    router.replace('/(tabs)/tasks' as any);
  } catch (e: any) {
    const msg = e?.response?.data?.message || 'Pogrešan email ili lozinka.';
    Alert.alert('Greška prijave', msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>🔨 Nail IT</Text>
        <Text style={styles.subtitle}>Prijava za radnike</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#aaa"
        />

        <TextInput
          style={styles.input}
          placeholder="Lozinka"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#aaa"
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Prijavi se</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 18, textAlign: 'center', color: '#666', marginBottom: 40 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: '#ddd', color: '#1A1A1A'
  },
  btn: { backgroundColor: '#FF6B35', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});