import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabase } from '../../services/supabase';

export default function PhoneScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email || !email.includes('@')) {
      setError('Vvedite pravilnyy email');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      navigation.navigate('OTP', { email });
    } catch (e) {
      setError('Oshibka otpravki koda. Poprobuyte snova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={s.inner}>
        <Text style={s.logo}>Animi</Text>
        <Text style={s.subtitle}>Vvedite vash email</Text>
        <TextInput
          style={s.input}
          placeholder="example@mail.ru"
          placeholderTextColor="#9B7B6A"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        {error ? <Text style={s.error}>{error}</Text> : null}
        <TouchableOpacity style={s.btn} onPress={handleSend} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Poluchit kod</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  logo: { fontSize: 42, fontWeight: 'bold', color: '#1A3D7C', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7A99', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#fff', borderRadius: 16, padding: 16, fontSize: 16, color: '#1A3D7C', marginBottom: 12, elevation: 4 },
  error: { color: '#E07070', fontSize: 13, marginBottom: 8, textAlign: 'center' },
  btn: { backgroundColor: '#1A3D7C', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 8, elevation: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});