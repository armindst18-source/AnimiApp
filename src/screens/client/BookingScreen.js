import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getAvailableSlots, createBooking } from '../../services/booking';
import { supabase } from '../../services/supabase';

const DAYS = ['Vsk', 'Pn', 'Vt', 'Sr', 'Cht', 'Pt', 'Sb'];
const MONTHS = ['Yanv', 'Fevr', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avg', 'Sent', 'Okt', 'Noyab', 'Dek'];

export default function BookingScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    generateCalendar(currentMonth);
  }, [currentMonth]);

  useEffect(() => {
    if (selectedDate) {
      loadSlots(selectedDate);
    }
  }, [selectedDate]);

  const generateCalendar = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    setCalendarDays(days);
  };

  const loadSlots = async (date) => {
    setLoading(true);
    setSelectedSlot(null);
    try {
      const data = await getAvailableSlots(date);
      setSlots(data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (day) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-${String(day).padStart(2, '0')}`;
  };

  const isPast = (day) => {
    const today = new Date();
    const date = new Date(formatDate(day));
    date.setHours(23, 59, 59);
    return date < today;
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await createBooking(user.id, selectedSlot.id, 'pending_payment');
      Alert.alert('Uspeshno!', 'Vasha zapis podtverzhdena.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Oshibka', e.message || 'Poprobuyte snova.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Zapisatsya na sessiyu</Text>
      </View>

      <View style={s.calendar}>
        <View style={s.monthRow}>
          <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
            <Text style={s.monthNav}>‹</Text>
          </TouchableOpacity>
          <Text style={s.monthName}>{MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}</Text>
          <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
            <Text style={s.monthNav}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={s.daysHeader}>
          {DAYS.map(d => <Text key={d} style={s.dayName}>{d}</Text>)}
        </View>

        <View style={s.daysGrid}>
          {calendarDays.map((day, i) => (
            <TouchableOpacity
              key={i}
              style={[
                s.dayCell,
                !day && s.dayCellEmpty,
                day && isPast(day) && s.dayCellPast,
                day && selectedDate === formatDate(day) && s.dayCellSelected,
              ]}
              onPress={() => day && !isPast(day) && setSelectedDate(formatDate(day))}
              disabled={!day || isPast(day)}
            >
              <Text style={[
                s.dayCellText,
                day && isPast(day) && s.dayCellTextPast,
                day && selectedDate === formatDate(day) && s.dayCellTextSelected,
              ]}>{day || ''}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {selectedDate && (
        <View style={s.slotsSection}>
          <Text style={s.slotsLabel}>DOSTUPNOYE VREMYA</Text>
          {loading ? (
            <ActivityIndicator color="#1A3D7C" />
          ) : slots.length === 0 ? (
            <Text style={s.noSlots}>Net dostupnykh sloтov na etot den</Text>
          ) : (
            <View style={s.slotsGrid}>
              {slots.map(slot => (
                <TouchableOpacity
                  key={slot.id}
                  style={[s.slot, selectedSlot?.id === slot.id && s.slotSelected]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[s.slotTime, selectedSlot?.id === slot.id && s.slotTimeSelected]}>
                    {slot.start_time}
                  </Text>
                  <Text style={[s.slotDur, selectedSlot?.id === slot.id && s.slotDurSelected]}>
                    1.5 ch · 6 500 ₽
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {selectedSlot && (
        <View style={s.bookBtnWrap}>
          <TouchableOpacity style={s.bookBtn} onPress={handleBook} disabled={booking}>
            {booking
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Text style={s.bookBtnText}>Zapisatsya — 6 500 ₽</Text>
                  <Text style={s.bookBtnSub}>{selectedDate} · {selectedSlot.start_time}–{selectedSlot.end_time}</Text>
                </>
            }
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 24, paddingTop: 60 },
  backBtn: { width: 36, height: 36, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  backBtnText: { fontSize: 18, color: '#1A3D7C' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0F2447' },
  calendar: { marginHorizontal: 24, backgroundColor: '#fff', borderRadius: 20, padding: 16, elevation: 2 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  monthName: { fontSize: 14, fontWeight: '700', color: '#0F2447' },
  monthNav: { fontSize: 22, color: '#2E5DA6', paddingHorizontal: 8 },
  daysHeader: { flexDirection: 'row', marginBottom: 8 },
  dayName: { flex: 1, textAlign: 'center', fontSize: 9, fontWeight: '700', color: '#6B7A99' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  dayCellEmpty: { opacity: 0 },
  dayCellPast: { opacity: 0.3 },
  dayCellSelected: { backgroundColor: '#1A3D7C' },
  dayCellText: { fontSize: 13, color: '#333' },
  dayCellTextPast: { color: '#aaa' },
  dayCellTextSelected: { color: '#fff', fontWeight: 'bold' },
  slotsSection: { padding: 24, paddingBottom: 0 },
  slotsLabel: { fontSize: 10, letterSpacing: 1.5, color: '#6B7A99', fontWeight: '600', marginBottom: 12 },
  noSlots: { color: '#6B7A99', textAlign: 'center', padding: 20 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 12, elevation: 2 },
  slotSelected: { backgroundColor: '#0F2447' },
  slotTime: { fontSize: 16, fontWeight: '700', color: '#0F2447', marginBottom: 2 },
  slotTimeSelected: { color: '#fff' },
  slotDur: { fontSize: 10, color: '#6B7A99' },
  slotDurSelected: { color: 'rgba(255,255,255,0.6)' },
  bookBtnWrap: { padding: 24 },
  bookBtn: { backgroundColor: '#1A3D7C', borderRadius: 18, padding: 16, alignItems: 'center', elevation: 8 },
  bookBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  bookBtnSub: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 3 },
});