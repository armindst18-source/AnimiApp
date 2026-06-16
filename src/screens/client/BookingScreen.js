import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../services/supabase';
import { TEXTS } from '../auth/WelcomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const pad = (n) => String(n).padStart(2, '0');
const formatDate = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

const getMonthDays = (year, month) => {
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
};

const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_RU = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const DAYS_EN = ['Mo','Tu','We','Th','Fr','Sa','Su'];

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  return `${parts[0]}:${parts[1]}`;
};

export default function BookingScreen({ navigation }) {
  const [lang, setLang] = useState('ru');
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem('lang').then(l => setLang(l || 'ru'));
  }, []);

  useEffect(() => {
    loadMonthAvailability();
  }, [year, month]);

  const t = TEXTS[lang];
  const MONTHS = lang === 'ru' ? MONTHS_RU : MONTHS_EN;
  const DAYS = lang === 'ru' ? DAYS_RU : DAYS_EN;

  const loadMonthAvailability = async () => {
    const from = formatDate(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const to = formatDate(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate());
    const { data } = await supabase
      .from('time_slots')
      .select('date')
      .gte('date', from)
      .lte('date', to)
      .eq('is_booked', false);
    const dates = [...new Set((data || []).map(d => d.date))];
    setAvailableDates(dates);
  };

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else { setMonth(m => m - 1); }
    setSelectedDate(null);
    setSlots([]);
    setSelectedSlot(null);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else { setMonth(m => m + 1); }
    setSelectedDate(null);
    setSlots([]);
    setSelectedSlot(null);
  };

  const handleDayPress = async (day) => {
    if (!day) return;
    const dateStr = formatDate(year, month, day);
    const todayStr = today.toISOString().split('T')[0];
    if (dateStr < todayStr) return;
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
      const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id)
        .in('status', ['pending_payment', 'confirmed']);
      if (existing && existing.length > 0) {
        Alert.alert(t.error, lang === 'ru' ? 'У вас уже есть активная запись.' : 'You already have an active booking.');
        setBooking(false);
        return;
      }
      const { error: bookErr } = await supabase.from('bookings').insert({
        user_id: user.id,
        slot_id: selectedSlot.id,
        status: 'pending_payment',
      });
      if (bookErr) throw bookErr;
      const { error: slotErr } = await supabase
        .from('time_slots').update({ is_booked: true }).eq('id', selectedSlot.id);
      if (slotErr) throw slotErr;
      navigation.replace('BookingSuccess', {
        date: selectedDate,
        startTime: formatTime(selectedSlot.start_time),
        endTime: formatTime(selectedSlot.end_time),
        lang,
      });
    } catch (e) {
      Alert.alert(t.error, e.message);
    } finally { setBooking(false); }
  };

  const days = getMonthDays(year, month);
  const todayStr = today.toISOString().split('T')[0];

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.bookNow}</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={s.calendarCard}>
        <View style={s.monthNav}>
          <TouchableOpacity style={s.navBtn} onPress={prevMonth}>
            <Text style={s.navBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={s.monthTitle}>{MONTHS[month]} {year}</Text>
          <TouchableOpacity style={s.navBtn} onPress={nextMonth}>
            <Text style={s.navBtnText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={s.dayNamesRow}>
          {DAYS.map((d, i) => (
            <Text key={i} style={[s.dayNameText, (i === 5 || i === 6) && s.weekend]}>{d}</Text>
          ))}
        </View>

        <View style={s.daysGrid}>
          {days.map((day, i) => {
            if (!day) return <View key={i} style={s.dayCell} />;
            const dateStr = formatDate(year, month, day);
            const isSelected = selectedDate === dateStr;
            const hasSlots = availableDates.includes(dateStr);
            const isPast = dateStr < todayStr;
            const dow = i % 7;
            const isWeekend = dow === 5 || dow === 6;
            return (
              <TouchableOpacity
                key={i}
                style={s.dayCell}
                onPress={() => handleDayPress(day)}
                disabled={isPast}
              >
                <View style={[s.dayInner, isSelected && s.dayInnerSelected, isPast && s.dayInnerPast]}>
                  <Text style={[
                    s.dayCellText,
                    isSelected && s.dayCellTextSelected,
                    isPast && s.dayCellTextPast,
                    isWeekend && !isSelected && !isPast && s.dayCellTextWeekend,
                  ]}>{day}</Text>
                </View>
                {hasSlots && !isPast && (
                  <View style={[s.dot, isSelected && s.dotSelected]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

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
                    {formatTime(slot.start_time)}
                  </Text>
                  <Text style={[s.slotEnd, selectedSlot?.id === slot.id && s.slotTimeActive]}>
                    {lang === 'ru' ? 'до' : 'to'} {formatTime(slot.end_time)}
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
            <Text style={s.confirmTime}>{formatTime(selectedSlot.start_time)} — {formatTime(selectedSlot.end_time)} · 1.5 {lang === 'ru' ? 'ч' : 'h'}</Text>
            <Text style={s.confirmPrice}>6 000 ₽</Text>
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
  calendarCard: { margin: 16, backgroundColor: '#fff', borderRadius: 20, padding: 16, elevation: 3 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  navBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' },
  navBtnText: { fontSize: 20, color: '#1A3D7C', fontWeight: '700' },
  monthTitle: { fontSize: 16, fontWeight: '700', color: '#0F2447' },
  dayNamesRow: { flexDirection: 'row', marginBottom: 8 },
  dayNameText: { flex: 1, textAlign: 'center', fontSize: 11, color: '#9BA8C0', fontWeight: '600' },
  weekend: { color: '#1A3D7C' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  dayInner: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  dayInnerSelected: { backgroundColor: '#1A3D7C' },
  dayInnerPast: { opacity: 0.3 },
  dayCellText: { fontSize: 13, fontWeight: '600', color: '#0F2447' },
  dayCellTextSelected: { color: '#fff' },
  dayCellTextPast: { color: '#9BA8C0' },
  dayCellTextWeekend: { color: '#1A3D7C' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#C9A84C', marginTop: 1 },
  dotSelected: { backgroundColor: '#C9A84C' },
  slotsSection: { paddingHorizontal: 20 },
  sectionLabel: { fontSize: 10, letterSpacing: 2, color: '#6B7A99', fontWeight: '700', marginBottom: 12 },
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
  confirmTime: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  confirmPrice: { fontSize: 22, fontWeight: '800', color: '#C9A84C' },
  bookBtn: { backgroundColor: '#C9A84C', borderRadius: 16, padding: 17, alignItems: 'center', elevation: 6 },
  bookBtnText: { color: '#0F2447', fontSize: 16, fontWeight: '800' },
});