import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { saveSlots } from '../../services/slots';

const WORK_START = '10:30';
const WORK_END   = '19:30';
const SESSION_MINS = 90;

const addMinutes = (time, mins) => {
  const [h, m] = time.split(':').map(Number);
  const total  = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const generateTimeSlots = () => {
  const slots = [];
  let current = WORK_START;
  while (true) {
    const end = addMinutes(current, SESSION_MINS);
    if (end > WORK_END) break;
    slots.push({ start: current, end });
    current = end;
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const getNext14Days = () => {
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
};

export default function DashboardScreen({ navigation }) {
  const [tab, setTab]                     = useState('today');
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedDate, setSelectedDate]   = useState(null);
  const [existingSlots, setExistingSlots] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [saving, setSaving]               = useState(false);
  const [psychName, setPsychName]         = useState('');
  const [switchingTest, setSwitchingTest] = useState(false);
  const days = getNext14Days();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile }  = await supabase
        .from('users').select('name').eq('id', user.id).single();
      setPsychName(profile?.name || 'Психолог');
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('bookings')
        .select('*, time_slots(*), users(*)')
        .filter('time_slots.date', 'eq', today);
      setTodayBookings(data || []);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const handleSelectDate = async (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedTimes([]);
    const { data } = await supabase
      .from('time_slots')
      .select('start_time')
      .eq('date', dateStr);
    setExistingSlots((data || []).map(d => d.start_time));
  };

  const toggleTime = (time) => {
    setSelectedTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const handleSave = async () => {
    if (!selectedDate || selectedTimes.length === 0) {
      Alert.alert('Ошибка', 'Выберите дату и хотя бы одно время');
      return;
    }
    setSaving(true);
    try {
      for (const slot of TIME_SLOTS) {
        if (selectedTimes.includes(slot.start)) {
          if (!existingSlots.includes(slot.start)) {
            await saveSlots(selectedDate, slot.start, slot.end);
          }
        } else {
          const { data: existing } = await supabase
            .from('time_slots')
            .select('id, is_booked')
            .eq('date', selectedDate)
            .eq('start_time', slot.start)
            .single();
          if (existing && !existing.is_booked) {
            await supabase.from('time_slots').delete().eq('id', existing.id);
          }
        }
      }
      Alert.alert('✅ Сохранено!', `График на ${selectedDate} обновлён.`);
      setSelectedTimes([]);
      setSelectedDate(null);
    } catch (e) { Alert.alert('Ошибка', e.message); }
    finally { setSaving(false); }
  };

  const handleSwitchToClient = async () => {
    setSwitchingTest(true);
    try {
      await supabase.auth.signOut();
      const { error } = await supabase.auth.signInWithPassword({
        email: 'test@animinava.app', password: 'test123456',
      });
      if (error) throw error;
    } catch (e) { Alert.alert('Ошибка', e.message); }
    finally { setSwitchingTest(false); }
  };

  if (loading) return (
    <View style={s.loader}><ActivityIndicator size="large" color="#C9A84C" /></View>
  );

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Добро пожаловать,</Text>
          <Text style={s.title}>{psychName}</Text>
        </View>
        <View style={s.headerBtns}>
          <TouchableOpacity style={s.testBtn} onPress={handleSwitchToClient} disabled={switchingTest}>
            {switchingTest
              ? <ActivityIndicator color="#C9A84C" size="small" />
              : <Text style={s.testBtnText}>👤</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => supabase.auth.signOut()}>
            <Text style={s.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.tabs}>
        <TouchableOpacity
          style={[s.tab, tab === 'today' && s.tabActive]}
          onPress={() => setTab('today')}
        >
          <Text style={[s.tabText, tab === 'today' && s.tabTextActive]}>📋 Сессии</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab === 'schedule' && s.tabActive]}
          onPress={() => setTab('schedule')}
        >
          <Text style={[s.tabText, tab === 'schedule' && s.tabTextActive]}>📅 График</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab === 'clients' && s.tabActive]}
          onPress={() => navigation.navigate('Clients')}
        >
          <Text style={[s.tabText, tab === 'clients' && s.tabTextActive]}>👥 Клиенты</Text>
        </TouchableOpacity>
      </View>

      {tab === 'today' && (
        <View style={s.section}>
          {todayBookings.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>☀️</Text>
              <Text style={s.emptyText}>Сегодня нет сессий</Text>
            </View>
          ) : (
            todayBookings.map(b => (
              <View key={b.id} style={s.sessionItem}>
                <View style={s.sessionTimeWrap}>
                  <Text style={s.sessionTimeText}>{b.time_slots?.start_time}</Text>
                  <Text style={s.sessionDur}>1.5 ч</Text>
                </View>
                <View style={s.sessionDiv} />
                <View style={s.sessionClient}>
                  <Text style={s.sessionClientName}>{b.users?.name || 'Клиент'}</Text>
                  <Text style={s.sessionStatus}>
                    {b.status === 'confirmed' ? '✅ Подтверждено' : '⏳ Ожидает оплаты'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={s.joinBtn}
                  onPress={() => navigation.navigate('PsychVideo', { bookingId: b.id })}
                >
                  <Text style={s.joinBtnText}>▶</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}

      {tab === 'schedule' && (
        <View style={s.section}>
          <Text style={s.scheduleLabel}>Выберите дату:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {days.map((d, i) => {
              const ds         = d.toISOString().split('T')[0];
              const isSelected = selectedDate === ds;
              return (
                <TouchableOpacity
                  key={i}
                  style={[s.dayBtn, isSelected && s.dayBtnActive]}
                  onPress={() => handleSelectDate(ds)}
                >
                  <Text style={[s.dayNum, isSelected && s.dayNumActive]}>{d.getDate()}</Text>
                  <Text style={[s.dayName, isSelected && s.dayNameActive]}>
                    {d.toLocaleDateString('ru-RU', { weekday: 'short' })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selectedDate && (
            <>
              <Text style={s.scheduleLabel}>
                Выберите рабочие часы (10:30 — 19:30, по 1.5 ч):
              </Text>
              <View style={s.timesGrid}>
                {TIME_SLOTS.map(slot => {
                  const isActive   = selectedTimes.includes(slot.start);
                  const isExisting = existingSlots.includes(slot.start);
                  return (
                    <TouchableOpacity
                      key={slot.start}
                      style={[
                        s.timeBtn,
                        isActive && s.timeBtnActive,
                        isExisting && !isActive && s.timeBtnExisting,
                      ]}
                      onPress={() => toggleTime(slot.start)}
                    >
                      <Text style={[s.timeTxt, (isActive || isExisting) && s.timeTxtActive]}>
                        {slot.start}
                      </Text>
                      <Text style={[s.timeEnd, (isActive || isExisting) && s.timeTxtActive]}>
                        — {slot.end}
                      </Text>
                      {isExisting && (
                        <Text style={s.existingTag}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={s.legend}>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: '#C9A84C' }]} />
                  <Text style={s.legendText}>Выбрано</Text>
                </View>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: '#22c55e' }]} />
                  <Text style={s.legendText}>Уже открыто</Text>
                </View>
              </View>
              <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#0F2447" />
                  : <Text style={s.saveBtnText}>Сохранить график</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2447' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F2447' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60 },
  greeting: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  title: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerBtns: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  testBtn: { backgroundColor: 'rgba(201,168,76,0.12)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  testBtnText: { fontSize: 16 },
  logoutIcon: { fontSize: 24 },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: '#C9A84C' },
  tabText: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  tabTextActive: { color: '#0F2447' },
  section: { paddingHorizontal: 20 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 15 },
  sessionItem: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  sessionTimeWrap: { alignItems: 'center', minWidth: 50 },
  sessionTimeText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  sessionDur: { fontSize: 9, color: 'rgba(255,255,255,0.35)' },
  sessionDiv: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.12)' },
  sessionClient: { flex: 1 },
  sessionClientName: { fontSize: 13, fontWeight: '700', color: '#fff', marginBottom: 3 },
  sessionStatus: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  joinBtn: { width: 36, height: 36, backgroundColor: '#C9A84C', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  joinBtnText: { color: '#0F2447', fontWeight: '700' },
  scheduleLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', marginBottom: 12, letterSpacing: 0.3 },
  dayBtn: { alignItems: 'center', marginLeft: 8, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 12, minWidth: 54 },
  dayBtnActive: { backgroundColor: '#C9A84C' },
  dayNum: { fontSize: 18, fontWeight: '700', color: '#fff' },
  dayNumActive: { color: '#0F2447' },
  dayName: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  dayNameActive: { color: '#0F2447' },
  timesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  timeBtn: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 12, alignItems: 'center', minWidth: '47%', position: 'relative' },
  timeBtnActive: { backgroundColor: '#C9A84C' },
  timeBtnExisting: { backgroundColor: 'rgba(34,197,94,0.2)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.4)' },
  timeTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  timeTxtActive: { color: '#0F2447' },
  timeEnd: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 2 },
  existingTag: { position: 'absolute', top: 6, right: 8, color: '#22c55e', fontSize: 12, fontWeight: '700' },
  legend: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  saveBtn: { backgroundColor: '#C9A84C', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 20 },
  saveBtnText: { color: '#0F2447', fontWeight: '800', fontSize: 15 },
});