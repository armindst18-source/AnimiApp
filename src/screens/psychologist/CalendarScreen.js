import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { supabase } from '../../services/supabase';

const pad = (n) => String(n).padStart(2, '0');
const formatDate = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

const getMonthDays = (year, month) => {
  const days     = [];
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  let startDow   = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
};

const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const DAYS_RU   = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

export default function CalendarScreen({ navigation }) {
  const today = new Date();
  const [year, setYear]                 = useState(today.getFullYear());
  const [month, setMonth]               = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots]               = useState([]);
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [bookedDates, setBookedDates]   = useState([]);

  useEffect(() => { loadMonthData(); }, [year, month]);

  const loadMonthData = async () => {
    const from = formatDate(year, month, 1);
    const to   = formatDate(year, month + 1, 0);
    const { data } = await supabase
      .from('time_slots').select('date')
      .gte('date', from).lte('date', to);
    const dates = [...new Set((data || []).map(d => d.date))];
    setBookedDates(dates);
  };

  const handleDayPress = async (day) => {
    if (!day) return;
    const dateStr = formatDate(year, month, day);
    setSelectedDate(dateStr);
    setSlots([]); setBookings([]);
    setLoading(true);
    try {
      const { data: slotData } = await supabase
        .from('time_slots').select('*')
        .eq('date', dateStr).order('start_time');
      setSlots(slotData || []);
      const { data: bookData } = await supabase
        .from('bookings')
        .select('*, time_slots(*), users(*)')
        .in('slot_id', (slotData || []).map(s => s.id));
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
          if (selectedDate) handleDayPress(parseInt(selectedDate.split('-')[2]));
          loadMonthData();
        },
      },
    ]);
  };

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else { setMonth(m => m - 1); }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else { setMonth(m => m + 1); }
    setSelectedDate(null);
  };

  const days    = getMonthDays(year, month);
  const todayStr = today.toISOString().split('T')[0];

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Календарь</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={s.calendarCard}>
        <View style={s.monthNav}>
          <TouchableOpacity style={s.navBtn} onPress={prevMonth}>
            <Text style={s.navBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={s.monthTitle}>{MONTHS_RU[month]} {year}</Text>
          <TouchableOpacity style={s.navBtn} onPress={nextMonth}>
            <Text style={s.navBtnText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={s.dayNamesRow}>
          {DAYS_RU.map((d, i) => (
            <Text key={i} style={[s.dayNameText, (i === 5 || i === 6) && s.weekend]}>{d}</Text>
          ))}
        </View>

        <View style={s.daysGrid}>
          {days.map((day, i) => {
            if (!day) return <View key={i} style={s.dayCell} />;
            const dateStr    = formatDate(year, month, day);
            const isToday    = dateStr === todayStr;
            const isSelected = selectedDate === dateStr;
            const hasSlots   = bookedDates.includes(dateStr);
            const dow        = i % 7;
            const isWeekend  = dow === 5 || dow === 6;
            return (
              <TouchableOpacity
                key={i}
                style={[s.dayCell, isToday && s.dayCellToday, isSelected && s.dayCellSelected]}
                onPress={() => handleDayPress(day)}
              >
                <Text style={[
                  s.dayCellText,
                  isToday && s.dayCellTextToday,
                  isSelected && s.dayCellTextSelected,
                  isWeekend && !isSelected && s.dayCellTextWeekend,
                ]}>{day}</Text>
                {hasSlots && (
                  <View style={[s.dot, isSelected && s.dotSelected]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {selectedDate && (
        <View style={s.slotsSection}>
          <Text style={s.slotsTitle}>СЛОТЫ НА {selectedDate}</Text>
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
                      <View>
                        <Text style={s.slotClient}>👤 {booked.users?.name || 'Клиент'}</Text>
                        <Text style={s.slotStatus}>
                          {booked.status === 'confirmed' ? '✅ Подтверждено' : '⏳ Ожидает'}
                        </Text>
                      </View>
                    ) : (
                      <Text style={s.slotFree}>Свободно</Text>
                    )}
                  </View>
                  {!booked && (
                    <TouchableOpacity style={s.deleteBtn} onPress={() => handleDeleteSlot(slot.id)}>
                      <Text style={s.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
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
  calendarCard: { margin: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  navBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.07)', justifyContent: 'center', alignItems: 'center' },
  navBtnText: { fontSize: 20, color: '#C9A84C', fontWeight: '700' },
  monthTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  dayNamesRow: { flexDirection: 'row', marginBottom: 8 },
  dayNameText: { flex: 1, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },
  weekend: { color: '#C9A84C' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  dayCellToday: { backgroundColor: 'rgba(201,168,76,0.12)' },
  dayCellSelected: { backgroundColor: '#C9A84C' },
  dayCellText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  dayCellTextToday: { color: '#C9A84C', fontWeight: '800' },
  dayCellTextSelected: { color: '#0F2447' },
  dayCellTextWeekend: { color: '#C9A84C' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(201,168,76,0.6)', marginTop: 2 },
  dotSelected: { backgroundColor: '#0F2447' },
  slotsSection: { paddingHorizontal: 20 },
  slotsTitle: { fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', fontWeight: '700', marginBottom: 12 },
  empty: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingVertical: 24, fontSize: 14 },
  slotItem: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  slotLeft: { flex: 1 },
  slotTime: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  slotClient: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 2 },
  slotStatus: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  slotFree: { color: '#C9A84C', fontSize: 12, fontWeight: '600' },
  deleteBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.15)', justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { color: '#f87171', fontSize: 14, fontWeight: '700' },
});