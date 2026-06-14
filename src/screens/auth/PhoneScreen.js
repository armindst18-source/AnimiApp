import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { TEXTS } from './WelcomeScreen';

export default function PhoneScreen({ navigation, route }) {
  const lang = route.params?.lang || 'ru';
  const t    = TEXTS[lang];
  const [email, setEmail]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [testClientLoading, setTestClientLoading] = useState(false);
  const [testPsychLoading, setTestPsychLoading]   = useState(false);
  const [error, setError]             = useState('');

  const handleSend = async () => {
    if (!email || !email.includes('@')) { setError(t.wrongEmail); return; }
    setLoading(true); setError('');
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      navigation.navigate('OTP', { email, lang });
    } catch { setError(t.sendErr); }
    finally { setLoading(false); }
  };

  const handleTestLogin = async (email, password, setter) => {
    setter(true); setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e) { setError('Error: ' + e.message); }
    finally { setter(false); }
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={s.inner}>
        <Text style={s.logo}>Animi Nava</Text>
        <Text style={s.subtitle}>{t.enterEmail}</Text>

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
            : <Text style={s.btnText}>{t.sendCode}</Text>}
        </TouchableOpacity>

        <View style={s.testSection}>
          <View style={s.testDivider}>
            <View style={s.testLine} />
            <Text style={s.testDividerText}>тест-режим</Text>
            <View style={s.testLine} />
          </View>

          <TouchableOpacity
            style={s.testBtn}
            onPress={() => handleTestLogin('test@animinava.app', 'test123456', setTestClientLoading)}
            disabled={testClientLoading}
          >
            {testClientLoading
              ? <ActivityIndicator color="#C9A84C" size="small" />
              : <Text style={s.testBtnText}>⚡ Войти как клиент</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.testBtn, s.testBtnPsych]}
            onPress={() => handleTestLogin('psych@animinava.app', 'psych123456', setTestPsychLoading)}
            disabled={testPsychLoading}
          >
            {testPsychLoading
              ? <ActivityIndicator color="#2E5DA6" size="small" />
              : <Text style={[s.testBtnText, s.testBtnTextPsych]}>🩺 Войти как психолог</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  logo: { fontSize: 42, fontWeight: 'bold', color: '#1A3D7C', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7A99', textAlign: 'center', marginBottom: 36 },
  input: { backgroundColor: '#fff', borderRadius: 16, padding: 16, fontSize: 16, color: '#1A3D7C', marginBottom: 12, elevation: 4 },
  error: { color: '#E07070', fontSize: 13, marginBottom: 8, textAlign: 'center' },
  btn: { backgroundColor: '#1A3D7C', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 4, elevation: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  testSection: { marginTop: 32 },
  testDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  testLine: { flex: 1, height: 1, backgroundColor: 'rgba(26,61,124,0.15)' },
  testDividerText: { fontSize: 11, color: '#9BA8C0', fontWeight: '500' },
  testBtn: { backgroundColor: 'rgba(201,168,76,0.1)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)', borderRadius: 12, padding: 13, alignItems: 'center', marginBottom: 10 },
  testBtnPsych: { backgroundColor: 'rgba(46,93,166,0.1)', borderColor: 'rgba(46,93,166,0.3)' },
  testBtnText: { color: '#C9A84C', fontSize: 13, fontWeight: '700' },
  testBtnTextPsych: { color: '#2E5DA6' },
});