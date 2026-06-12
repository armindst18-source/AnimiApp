import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { TEXTS } from '../auth/WelcomeScreen';

const FACTS_RU = [
  { icon: '🎓', text: 'Дипломированный специалист (профессиональная переподготовка)' },
  { icon: '⭐', text: '4,5 года успешной психологической практики' },
  { icon: '💡', text: 'Метод одной сессии — короткосрочная эффективная помощь' },
  { icon: '🤝', text: 'Бережно и эффективно помогаю находить выходы из сложных ситуаций' },
  { icon: '🔒', text: 'Полная конфиденциальность каждой сессии' },
];

const FACTS_EN = [
  { icon: '🎓', text: 'Licensed specialist (professional retraining)' },
  { icon: '⭐', text: '4.5 years of successful psychological practice' },
  { icon: '💡', text: 'Single session method — short-term effective help' },
  { icon: '🤝', text: 'Gently and effectively helping to find ways out of difficult situations' },
  { icon: '🔒', text: 'Full confidentiality of every session' },
];

export default function AboutPsychScreen({ navigation, route }) {
  const lang  = route.params?.lang || 'ru';
  const t     = TEXTS[lang];
  const facts = lang === 'ru' ? FACTS_RU : FACTS_EN;

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.aboutPsych}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={s.heroSection}>
        <View style={s.photoWrap}>
          <Image
            source={require('../../assets/psychologist.png')}
            style={s.photo}
            resizeMode="cover"
          />
        </View>
        <Text style={s.psychName}>Маргарита Журавлёва</Text>
        <Text style={s.psychRole}>{lang === 'ru' ? 'Практикующий психолог' : 'Practicing psychologist'}</Text>
        <View style={s.ratingRow}>
          {[1,2,3,4,5].map(i => <Text key={i} style={s.star}>★</Text>)}
          <Text style={s.ratingText}>5.0</Text>
        </View>
      </View>

      <View style={s.factsSection}>
        {facts.map((f, i) => (
          <View key={i} style={s.factItem}>
            <Text style={s.factIcon}>{f.icon}</Text>
            <Text style={s.factText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.bookBtn} onPress={() => navigation.navigate('Booking')}>
        <Text style={s.bookBtnText}>{t.bookNow}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 56, paddingBottom: 8 },
  back: { color: '#1A3D7C', fontSize: 22, fontWeight: '700' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F2447' },
  heroSection: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24 },
  photoWrap: { width: 120, height: 120, borderRadius: 36, overflow: 'hidden', marginBottom: 16, elevation: 8 },
  photo: { width: 120, height: 120 },
  psychName: { fontSize: 22, fontWeight: '800', color: '#0F2447', marginBottom: 4 },
  psychRole: { fontSize: 13, color: '#6B7A99', marginBottom: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  star: { color: '#C9A84C', fontSize: 18 },
  ratingText: { color: '#C9A84C', fontWeight: '700', fontSize: 14, marginLeft: 4 },
  factsSection: { marginHorizontal: 20, gap: 10 },
  factItem: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 14, elevation: 1 },
  factIcon: { fontSize: 22, marginTop: 2 },
  factText: { flex: 1, fontSize: 13, color: '#0F2447', lineHeight: 20 },
  bookBtn: { marginHorizontal: 20, marginTop: 24, backgroundColor: '#1A3D7C', borderRadius: 16, padding: 17, alignItems: 'center', elevation: 6 },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});