import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { saveSlots } from '../../services/slots';

const TIMES = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30'];

export default function CalendarScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [loading, setLoading] = useState(false);

  const getNext14Days = () => {
    const days = [];
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const formatDate = (date) => date.toISOString().split('T')[0];

  const toggleTime = (time) => {
    setSelectedTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const handleSave = async () => {
    if (!selectedDate || selectedTimes.length === 0) {
      Alert.alert('Oshibka', 'Vyberite datu i vremya');
      return;
    }
    setLoading(true);
    try {
      for (const time of selectedTimes) {
        const [h, m] = time.split(':').map(Number);
        const endH = Math.floor((h * 60 + m + 90) / 60);
        const endM = (h * 60 + m + 90) % 60;
        const endTime = `${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`;
        await saveSlots(selectedDate, time, endTime);
      }
      Alert.alert('Uspeshno!', `Sloty na ${selectedDate} sozdany.`);
      setSelectedTimes([]);
      setSelectedDate(null);
    } catch (e) {
      Alert.alert('Oshibka', e.message);
    } finally {
      setLoading(false);
    }
  };

  const days = getNext14Days();

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Upravleniye raspisaniyem</Text>
      </View>

      <Text style={s.label}>VYBRAT DATU</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.daysScroll}>
        {days.map(d => (
          <TouchableOpacity
            key={formatDate(d)}
            style={[s.dayChip, selectedDate === formatDate(d) && s.dayChipSelected]}
            onPress={() => setSelectedDate(formatDate(d))}
          >
            <Text style={[s.dayChipDay, selectedDate === formatDate(d) && s.dayChipTextSelected]}>
              {d.toLocaleDateString('ru-RU', { weekday: 'short' })}
            </Text>
            <Text style={[s.dayChipNum, selectedDate === formatDate(d) && s.dayChipTextSelected]}>
              {d.getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedDate && (
        <>
          <Text style={s.label}>VYBRAT VREMYA</Text>
          <View style={s.timesGrid}>
            {TIMES.map(time => (
              <TouchableOpacity
                key={time}
                style={[s.timeChip, selectedTimes.includes(time) && s.timeChipSelected]}
                onPress={() => toggleTime(time)}
              >
                <Text style={[s.timeChipText, selectedTimes.includes(time) && s.timeChipTextSelected]}>
                  {time}
                </Text>
                <Text style={[s.timeChipDur, selectedTimes.includes(time) && s.timeChipTextSelected]}>
                  1.5 ch
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.saveBtnText}>Sokhranit raspisaniye</Text>
            }
          </TouchableOpacity>
        </>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2447' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 24, paddingTop: 60 },
  backBtn: { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  backBtnText: { fontSize: 18, color: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  label: { fontSize: 10, letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)', fontWeight: '600', paddingHorizontal: 24, marginBottom: 12 },
  daysScroll: { paddingHorizontal: 24, marginBottom: 24 },
  dayChip: { width: 56, height: 70, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, marginLeft: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  dayChipSelected: { backgroundColor: '#2E5DA6', borderColor: '#2E5DA6' },
  dayChipDay: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
  dayChipNum: { fontSize: 18, fontWeight: '700', color: '#fff' },
  dayChipTextSelected: { color: '#fff' },
  timesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 24, marginBottom: 24 },
  timeChip: { width: '47%', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  timeChipSelected: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  timeChipText: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
  timeChipDur: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  timeChipTextSelected: { color: '#0F2447' },
  saveBtn: { marginHorizontal: 24, backgroundColor: '#2E5DA6', borderRadius: 16, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});