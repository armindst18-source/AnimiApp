import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { supabase } from '../../services/supabase';

const getNext30Days = () => {
  const days = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
};

export default function CalendarScreen({ navigation }) {
  const [days]                          = useState(getNext30Days());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots]               = useState([]);
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(false);

  const handleDayPress = async (dateStr) => {
    setSelectedDate(dateStr);
    setSlots([]);
    setBookings([]);
    setLoading(true);
    try {
      const { data: slotData } = await supabase
        .from('time_slots').select('*')
        .eq('date', dateStr).order('start_time');
      setSlots(slotData || []);

      const { data: bookData } = await supabase
        .from('bookings')
        .select('*, time_slots(*), users(*)')
        .eq('time_slots.date', dateStr);
      setBookings(bookData || []);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const handleDeleteSlot = (slotId) => {
    Alert.alert('Удалить слот?', 'Этот слот будет удалён.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить', style: 'destructive',
        onPress: async () => {
          await supabase.from('time_slots').delete().eq('id', slotId);
          if (selectedDate) handleDayPress(selectedDate);
        },
      },
    ]);
  };

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Календарь</Text>
        <View style={{ width: 32 }} />
      </View>

      <Text style={s.sectionLabel}>ВЫБЕРИТЕ ДАТУ</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.daysRow}>
        {days.map((d, i) => {
          const ds = d.toISOString().split('T')[0];
          const sel = selectedDate === ds;
          return (
            <TouchableOpacity key={i} style={[s.dayBtn, sel && s.dayBtnActive]} onPress={() => handleDayPress(ds)}>
              <Text style={[s.dayNum, sel && s.dayNumActive]}>{d.getDate()}</Text>
              <Text style={[s.dayName, sel && s.dayNameActive]}>
                {d.toLocaleDateString('ru-RU', { weekday: 'short' })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedDate && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>СЛОТЫ НА {selectedDate}</Text>
          {loading ? (
            <ActivityIndicator color="#C9A84C" style={{ marginTop: 20 }} />
          ) : slots.length === 0 ? (
            <Text style={s.empty}>Нет слотов на этот день</Text>
          ) : (
            slots.map(slot => {
              const booked = bookings.find(b => b.slot_id === slot.id);
              return (
                <View key={slot.id} style={s.slotItem}>
                  <View style={s.slotLeft}>
                    <Text style={s.slotTime}>{slot.start_time} — {slot.end_time}</Text>
                    {booked ? (
                      <Text style={s.slotClient}>👤 {booked.users?.name || 'Клиент'}</Text>
                    ) : (
                      <Text style={s.slotFree}>Свободно</Text>
                    )}
                  </View>
                  {!booked && (
                    <TouchableOpacity style={s.deleteBtn} onPress={() => handleDeleteSlot(slot.id)}>
                      <Text style={s.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
                  )}
                  {booked && (
                    <View style={[s.statusBadge, booked.status === 'confirmed' && s.statusBadgeOk]}>
                      <Text style={s.statusBadgeText}>
                        {booked.status === 'confirmed' ? '✅' : '⏳'}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      )}
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2447' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 56, paddingBottom: 8 },
  back: { color: '#C9A84C', fontSize: 22, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionLabel: { fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', fontWeight: '700', paddingHorizontal: 24, marginTop: 20, marginBottom: 12 },
  daysRow: { paddingHorizontal: 16, marginBottom: 8 },
  dayBtn: { alignItems: 'center', marginHorizontal: 6, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 12, minWidth: 56 },
  dayBtnActive: { backgroundColor: '#C9A84C' },
  dayNum: { fontSize: 20, fontWeight: '700', color: '#fff' },
  dayNumActive: { color: '#0F2447' },
  dayName: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  dayNameActive: { color: '#0F2447' },
  section: { paddingHorizontal: 20 },
  empty: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingVertical: 24, fontSize: 14 },
  slotItem: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  slotLeft: { flex: 1 },
  slotTime: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  slotClient: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  slotFree: { color: '#C9A84C', fontSize: 12, fontWeight: '600' },
  deleteBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.15)', justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { color: '#f87171', fontSize: 14, fontWeight: '700' },
  statusBadge: { backgroundColor: 'rgba(234,179,8,0.15)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  statusBadgeOk: { backgroundColor: 'rgba(34,197,94,0.15)' },
  statusBadgeText: { fontSize: 16 },
});