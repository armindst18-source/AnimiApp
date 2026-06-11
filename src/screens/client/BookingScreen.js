import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../services/supabase';
import { TEXTS } from '../auth/WelcomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getNext30Days = () => {
  const days = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
};

export default function BookingScreen({ navigation }) {
  const [lang, setLang]             = useState('ru');
  const [days]                      = useState(getNext30Days());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots]           = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking]       = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('lang').then(l => setLang(l || 'ru'));
  }, []);

  const t = TEXTS[lang];

  const handleDayPress = async (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setSlots([]);
    setLoadingSlots(true);
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('date', dateStr)
        .eq('is_booked', false)
        .order('start_time');
      if (error) throw error;
      setSlots(data || []);
    } catch (e) { console.log(e); }
    finally { setLoadingSlots(false); }
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: bookErr } = await supabase.from('bookings').insert({
        user_id: user.id,
        slot_id: selectedSlot.id,
        status: 'pending_payment',
      });
      if (bookErr) throw bookErr;
      const { error: slotErr } = await supabase
        .from('time_slots').update({ is_booked: true }).eq('id', selectedSlot.id);
      if (slotErr) throw slotErr;
      Alert.alert(t.bookSuccess, t.bookSuccessMsg, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert(t.error, e.message);
    } finally { setBooking(false); }
  };

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.bookNow}</Text>
        <View style={{ width: 32 }} />
      </View>

      <Text style={s.sectionLabel}>ВЫБЕРИТЕ ДАТУ</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.daysRow}>
        {days.map((d, i) => {
          const ds = d.toISOString().split('T')[0];
          const selected = selectedDate === ds;
          return (
            <TouchableOpacity key={i} style={[s.dayBtn, selected && s.dayBtnActive]} onPress={() => handleDayPress(ds)}>
              <Text style={[s.dayNum, selected && s.dayNumActive]}>{d.getDate()}</Text>
              <Text style={[s.dayName, selected && s.dayNameActive]}>
                {d.toLocaleDateString('ru-RU', { weekday: 'short' })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedDate && (
        <View style={s.slotsSection}>
          <Text style={s.sectionLabel}>{t.availableTime}</Text>
          {loadingSlots ? (
            <ActivityIndicator size="large" color="#1A3D7C" style={{ marginTop: 24 }} />
          ) : slots.length === 0 ? (
            <View style={s.noSlotsWrap}>
              <Text style={s.noSlots}>{t.noSlots}</Text>
            </View>
          ) : (
            <View style={s.slotsGrid}>
              {slots.map(slot => (
                <TouchableOpacity
                  key={slot.id}
                  style={[s.slotBtn, selectedSlot?.id === slot.id && s.slotBtnActive]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[s.slotTime, selectedSlot?.id === slot.id && s.slotTimeActive]}>
                    {slot.start_time}
                  </Text>
                  <Text style={[s.slotEnd, selectedSlot?.id === slot.id && s.slotTimeActive]}>
                    до {slot.end_time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {selectedSlot && (
        <View style={s.confirmSection}>
          <View style={s.confirmCard}>
            <Text style={s.confirmDate}>{selectedDate}</Text>
            <Text style={s.confirmTime}>{selectedSlot.start_time} — {selectedSlot.end_time} · 1.5 ч</Text>
          </View>
          <TouchableOpacity style={s.bookBtn} onPress={handleBook} disabled={booking}>
            {booking ? <ActivityIndicator color="#0F2447" /> : <Text style={s.bookBtnText}>{t.book}</Text>}
          </TouchableOpacity>
        </View>
      )}
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 56, paddingBottom: 8 },
  back: { color: '#1A3D7C', fontSize: 22, fontWeight: '700' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F2447' },
  sectionLabel: { fontSize: 10, letterSpacing: 2, color: '#6B7A99', fontWeight: '700', paddingHorizontal: 24, marginTop: 20, marginBottom: 12 },
  daysRow: { paddingHorizontal: 16, marginBottom: 8 },
  dayBtn: { alignItems: 'center', marginHorizontal: 6, backgroundColor: '#fff', borderRadius: 16, padding: 12, minWidth: 56, elevation: 2 },
  dayBtnActive: { backgroundColor: '#1A3D7C' },
  dayNum: { fontSize: 20, fontWeight: '700', color: '#0F2447' },
  dayNumActive: { color: '#fff' },
  dayName: { fontSize: 10, color: '#6B7A99', marginTop: 2 },
  dayNameActive: { color: 'rgba(255,255,255,0.7)' },
  slotsSection: { paddingHorizontal: 24, marginTop: 8 },
  noSlotsWrap: { alignItems: 'center', paddingVertical: 32 },
  noSlots: { color: '#6B7A99', fontSize: 14 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotBtn: { backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', minWidth: '47%', elevation: 2 },
  slotBtnActive: { backgroundColor: '#1A3D7C' },
  slotTime: { fontSize: 18, fontWeight: '700', color: '#0F2447' },
  slotTimeActive: { color: '#fff' },
  slotEnd: { fontSize: 11, color: '#6B7A99', marginTop: 3 },
  confirmSection: { padding: 24 },
  confirmCard: { backgroundColor: '#1A3D7C', borderRadius: 20, padding: 20, marginBottom: 16 },
  confirmDate: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  confirmTime: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  bookBtn: { backgroundColor: '#C9A84C', borderRadius: 16, padding: 17, alignItems: 'center', elevation: 6 },
  bookBtnText: { color: '#0F2447', fontSize: 16, fontWeight: '800' },
});