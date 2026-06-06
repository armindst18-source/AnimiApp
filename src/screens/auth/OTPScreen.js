import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabase } from '../../services/supabase';

export default function OTPScreen({ route }) {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState('otp');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (code.length < 6) {
      setError('Vvedite 6-znachnyy kod');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });
      if (error) throw error;
      setStep('name');
    } catch (e) {
      setError('Neviernyy kod. Poprobuyte snova.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      setError('Vvedite vashe imya');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('users').upsert({
        id: user.id,
        phone: email,
        name: name.trim(),
        role: 'client',
      });
    } catch (e) {
      setError('Oshibka sokhraneniya.');
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
        {step === 'otp' ? (
          <>
            <Text style={s.subtitle}>Kod otpravlen na {email}</Text>
            <TextInput
              style={s.inputCode}
              placeholder="------"
              placeholderTextColor="#9B7B6A"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
              maxLength={6}
            />
            {error ? <Text style={s.error}>{error}</Text> : null}
            <TouchableOpacity style={s.btn} onPress={handleVerify} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnText}>Podtverdit</Text>
              }
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={s.subtitle}>Kak vas zovut?</Text>
            <TextInput
              style={s.input}
              placeholder="Vashe imya"
              placeholderTextColor="#9B7B6A"
              value={name}
              onChangeText={setName}
            />
            {error ? <Text style={s.error}>{error}</Text> : null}
            <TouchableOpacity style={s.btn} onPress={handleSaveName} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnText}>Prodolzhit</Text>
              }
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  logo: { fontSize: 42, fontWeight: 'bold', color: '#1A3D7C', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7A99', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#fff', borderRadius: 16, padding: 16, fontSize: 16, color: '#1A3D7C', marginBottom: 12, elevation: 4 },
  inputCode: { backgroundColor: '#fff', borderRadius: 16, padding: 16, fontSize: 28, color: '#1A3D7C', marginBottom: 12, elevation: 4, textAlign: 'center', letterSpacing: 10 },
  error: { color: '#E07070', fontSize: 13, marginBottom: 8, textAlign: 'center' },
  btn: { backgroundColor: '#1A3D7C', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 8, elevation: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});