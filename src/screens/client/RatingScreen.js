import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { TEXTS } from '../auth/WelcomeScreen';

export default function RatingScreen({ navigation, route }) {
  const { bookingId, lang = 'ru' } = route.params || {};
  const t = TEXTS[lang];
  const [rating, setRating]   = useState(0);
  const [saving, setSaving]   = useState(false);
  const [done, setDone]       = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSaving(true);
    try {
      await supabase.from('bookings').update({ rating }).eq('id', bookingId);
      setDone(true);
      setTimeout(() => navigation.replace('Home'), 1500);
    } catch (e) { console.log(e); }
    finally { setSaving(false); }
  };

  const handleSkip = () => navigation.replace('Home');

  if (done) return (
    <View style={s.container}>
      <Text style={s.doneIcon}>🙏</Text>
      <Text style={s.doneText}>{t.ratingThanks}</Text>
    </View>
  );

  return (
    <View style={s.container}>
      <Text style={s.title}>{t.rating}</Text>
      <Text style={s.desc}>{t.ratingDesc}</Text>

      <View style={s.starsRow}>
        {[1,2,3,4,5].map(i => (
          <TouchableOpacity key={i} onPress={() => setRating(i)}>
            <Text style={[s.star, i <= rating && s.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[s.btn, rating === 0 && s.btnDisabled]}
        onPress={handleSubmit}
        disabled={rating === 0 || saving}
      >
        {saving
          ? <ActivityIndicator color="#0F2447" />
          : <Text style={s.btnText}>{t.ratingSubmit}</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={s.skipBtn} onPress={handleSkip}>
        <Text style={s.skipText}>{t.ratingSkip}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center', padding: 32 },
  doneIcon: { fontSize: 60, marginBottom: 16 },
  doneText: { fontSize: 18, fontWeight: '700', color: '#0F2447', textAlign: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#0F2447', marginBottom: 10, textAlign: 'center' },
  desc: { fontSize: 13, color: '#6B7A99', textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  starsRow: { flexDirection: 'row', gap: 12, marginBottom: 36 },
  star: { fontSize: 44, color: 'rgba(201,168,76,0.25)' },
  starActive: { color: '#C9A84C' },
  btn: { backgroundColor: '#1A3D7C', borderRadius: 16, padding: 16, alignItems: 'center', width: '100%', elevation: 6, marginBottom: 12 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipBtn: { padding: 12 },
  skipText: { color: '#9BA8C0', fontSize: 13 },
});