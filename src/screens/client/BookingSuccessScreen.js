import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { TEXTS } from '../auth/WelcomeScreen';

export default function BookingSuccessScreen({ navigation, route }) {
  const { date, startTime, endTime, lang = 'ru' } = route.params || {};
  const t = TEXTS[lang];

  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={s.container}>
      <Animated.View style={[s.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={s.icon}>✓</Text>
      </Animated.View>

      <Animated.View style={[s.content, { opacity: opacityAnim }]}>
        <Text style={s.title}>{t.bookingConfirmed}</Text>

        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.label}>{t.bookingDate}</Text>
            <Text style={s.value}>{date}</Text>
          </View>
          <View style={s.sep} />
          <View style={s.row}>
            <Text style={s.label}>{t.bookingTime}</Text>
            <Text style={s.value}>{startTime} — {endTime}</Text>
          </View>
          <View style={s.sep} />
          <View style={s.row}>
            <Text style={s.label}>{t.bookingDuration}</Text>
            <Text style={s.value}>{t.bookingDurationVal}</Text>
          </View>
        </View>

        <TouchableOpacity style={s.btn} onPress={() => navigation.replace('Home')}>
          <Text style={s.btnText}>{t.backHome}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center', padding: 32 },
  iconWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#22c55e', justifyContent: 'center', alignItems: 'center', marginBottom: 28, elevation: 8 },
  icon: { color: '#fff', fontSize: 48, fontWeight: '700' },
  content: { width: '100%', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#0F2447', marginBottom: 24 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 3, marginBottom: 28 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  label: { color: '#6B7A99', fontSize: 13 },
  value: { fontWeight: '700', color: '#0F2447', fontSize: 13 },
  sep: { height: 1, backgroundColor: '#F0F4FF', marginHorizontal: 16 },
  btn: { backgroundColor: '#1A3D7C', borderRadius: 16, padding: 16, alignItems: 'center', width: '100%', elevation: 6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});