import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../../services/supabase';
import { TEXTS } from './WelcomeScreen';

export default function OTPScreen({ route, navigation }) {
  const { email, lang = 'ru' } = route.params;
  const t = TEXTS[lang];
  const [code, setCode]     = useState('');
  const [name, setName]     = useState('');
  const [step, setStep]     = useState('otp');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleVerify = async () => {
    if (code.length < 6) { setError(t.enterCode); return; }
    setLoading(true); setError('');
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
      if (error) throw error;
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile }  = await supabase.from('users').select('name').eq('id', user.id).single();
      if (profile?.name) { navigation.replace('Home'); }
      else               { setStep('name'); }
    } catch { setError(t.wrongCode); }
    finally { setLoading(false); }
  };

  const handleSaveName = async () => {
    if (!name.trim()) { setError(t.nameRequired); return; }
    setLoading(true); setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('users').upsert({
        id: user.id, name: name.trim(), phone: email, role: 'client', language: lang,
      });
      if (error) throw error;
      navigation.replace('Home');
    } catch { setError(t.saveErr); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.inner}>
        <Text style={s.logo}>Animi</Text>
        {step === 'otp' ? (
          <>
            <Text style={s.subtitle}>{t.codeSent} {email}</Text>
            <TextInput style={s.inputCode} placeholder="-------" placeholderTextColor="#9B7B6A"
              keyboardType="number-pad" value={code} onChangeText={setCode} maxLength={7} />
            {error ? <Text style={s.error}>{error}</Text> : null}
            <TouchableOpacity style={s.btn} onPress={handleVerify} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{t.confirm}</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={s.subtitle}>{t.yourName}</Text>
            <TextInput style={s.input} placeholder={t.namePlaceholder} placeholderTextColor="#9B7B6A"
              value={name} onChangeText={setName} maxLength={30} />
            {error ? <Text style={s.error}>{error}</Text> : null}
            <TouchableOpacity style={s.btn} onPress={handleSaveName} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{t.continueTxt}</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#F0F4FF'},
  inner:{flex:1,justifyContent:'center',paddingHorizontal:32},
  logo:{fontSize:42,fontWeight:'bold',color:'#1A3D7C',textAlign:'center',marginBottom:8},
  subtitle:{fontSize:14,color:'#6B7A99',textAlign:'center',marginBottom:32,lineHeight:22},
  input:{backgroundColor:'#fff',borderRadius:16,padding:16,fontSize:16,color:'#1A3D7C',marginBottom:12,elevation:4},
  inputCode:{backgroundColor:'#fff',borderRadius:16,padding:16,fontSize:28,color:'#1A3D7C',marginBottom:12,elevation:4,textAlign:'center',letterSpacing:10},
  error:{color:'#E07070',fontSize:13,marginBottom:8,textAlign:'center'},
  btn:{backgroundColor:'#1A3D7C',borderRadius:16,padding:16,alignItems:'center',marginTop:8,elevation:8},
  btnText:{color:'#fff',fontSize:16,fontWeight:'700'},
});