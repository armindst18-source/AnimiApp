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
    
      
         navigation.goBack()}>
          ←
        
        {t.bookNow}
        
      

      
        
          
            ‹
          
          {MONTHS[month]} {year}
          
            ›
          
        

        
          {DAYS.map((d, i) => (
            {d}
          ))}
        

        
          {days.map((day, i) => {
            if (!day) return ;
            const dateStr = formatDate(year, month, day);
            const isSelected = selectedDate === dateStr;
            const hasSlots = availableDates.includes(dateStr);
            const isPast = dateStr < todayStr;
            const isToday = dateStr === todayStr;
            const dow = i % 7;
            const isWeekend = dow === 5 || dow === 6;
            return (
               handleDayPress(day)}
                disabled={isPast}
              >
                
                  {day}
                
                {hasSlots && !isPast && (
                  
                )}
              
            );
          })}
        
      

      {selectedDate && (
        
          {t.availableTime}
          {loadingSlots ? (
            
          ) : slots.length === 0 ? (
            
              {t.noSlots}
            
          ) : (
            
              {slots.map(slot => (
                 setSelectedSlot(slot)}
                >
                  
                    {formatTime(slot.start_time)}
                  
                  
                    {lang === 'ru' ? 'до' : 'to'} {formatTime(slot.end_time)}
                  
                
              ))}
            
          )}
        
      )}

      {selectedSlot && (
        
          
            {selectedDate}
            {formatTime(selectedSlot.start_time)} — {formatTime(selectedSlot.end_time)} · 1.5 {lang === 'ru' ? 'ч' : 'h'}
            6 000 ₽
          
          
            {booking ?  : {t.book}}
          
        
      )}
      
    
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2447' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 56, paddingBottom: 8 },
  back: { color: '#C9A84C', fontSize: 22, fontWeight: '700' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  calendarCard: { margin: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  navBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.07)', justifyContent: 'center', alignItems: 'center' },
  navBtnText: { fontSize: 20, color: '#C9A84C', fontWeight: '700' },
  monthTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  dayNamesRow: { flexDirection: 'row', marginBottom: 8 },
  dayNameText: { flex: 1, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },
  weekend: { color: '#C9A84C' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  dayInner: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  dayInnerToday: { backgroundColor: 'rgba(201,168,76,0.2)' },
  dayInnerSelected: { backgroundColor: '#C9A84C' },
  dayInnerPast: { opacity: 0.3 },
  dayCellText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  dayCellTextToday: { color: '#C9A84C', fontWeight: '800' },
  dayCellTextSelected: { color: '#0F2447' },
  dayCellTextPast: { color: 'rgba(255,255,255,0.3)' },
  dayCellTextWeekend: { color: '#C9A84C' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(201,168,76,0.6)', marginTop: 1 },
  dotSelected: { backgroundColor: '#0F2447' },
  slotsSection: { paddingHorizontal: 20 },
  sectionLabel: { fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', fontWeight: '700', marginBottom: 12 },
  noSlotsWrap: { alignItems: 'center', paddingVertical: 32 },
  noSlots: { color: 'rgba(255,255,255,0.3)', fontSize: 14 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotBtn: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 14, alignItems: 'center', minWidth: '47%' },
  slotBtnActive: { backgroundColor: '#C9A84C' },
  slotTime: { fontSize: 18, fontWeight: '700', color: '#fff' },
  slotTimeActive: { color: '#0F2447' },
  slotEnd: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 },
  confirmSection: { padding: 24 },
  confirmCard: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)' },
  confirmDate: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  confirmTime: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  confirmPrice: { fontSize: 22, fontWeight: '800', color: '#C9A84C' },
  bookBtn: { backgroundColor: '#C9A84C', borderRadius: 16, padding: 17, alignItems: 'center', elevation: 6 },
  bookBtnText: { color: '#0F2447', fontSize: 16, fontWeight: '800' },
});