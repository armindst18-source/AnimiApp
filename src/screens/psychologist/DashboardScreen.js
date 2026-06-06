import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { signOut } from '../../services/auth';
import { getAllBookings } from '../../services/booking';

export default function DashboardScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ today: 0, month: 0, income: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getAllBookings();
      setBookings(data || []);
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = data?.filter(b => b.time_slots?.date === today) || [];
      const monthBookings = data?.filter(b => {
        const d = b.time_slots?.date || '';
        return d.startsWith(new Date().toISOString().slice(0, 7));
      }) || [];
      setStats({
        today: todayBookings.length,
        month: monthBookings.length,
        income: monthBookings.length * 6500,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#C9A84C" />
      </View>
    );
  }

  const todayBookings = bookings.filter(b =>
    b.time_slots?.date === new Date().toISOString().split('T')[0]
  );

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Dobryy den</Text>
          <Text style={s.title}>Moy kabinet</Text>
        </View>
        <TouchableOpacity style={s.photoContainer} onPress={signOut}>
          <Text style={s.photoText}>👩</Text>
        </TouchableOpacity>
      </View>

      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={s.statValue}>{stats.today}</Text>
          <Text style={s.statLabel}>SEGODNYA</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statValue}>{stats.month}</Text>
          <Text style={s.statLabel}>ZA MESYATS</Text>
        </View>
        <View style={s.statCard}>
          <Text style={[s.statValue, s.statValueGold]}>{stats.income}₽</Text>
          <Text style={s.statLabel}>DOKHOD</Text>
        </View>
      </View>

      <View style={s.actionsRow}>
        <TouchableOpacity
          style={s.actionBtn}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Text style={s.actionBtnIcon}>📅</Text>
          <Text style={s.actionBtnText}>Raspisaniye</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.actionBtn}
          onPress={() => navigation.navigate('Clients')}
        >
          <Text style={s.actionBtnIcon}>👥</Text>
          <Text style={s.actionBtnText}>Klienty</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn}>
          <Text style={s.actionBtnIcon}>📁</Text>
          <Text style={s.actionBtnText}>Zadaniya</Text>
        </TouchableOpacity>
      </View>

      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>SESSII SEGODNYA</Text>
          <Text style={s.sectionDate}>
            {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          </Text>
        </View>

        {todayBookings.length === 0 ? (
          <Text style={s.noSessions}>Net sessiy segodnya</Text>
        ) : (
          todayBookings.map(b => (
            <View key={b.id} style={s.sessionItem}>
              <View style={s.sessionTime}>
                <Text style={s.sessionTimeText}>{b.time_slots?.start_time}</Text>
                <Text style={s.sessionDur}>1.5 ch</Text>
              </View>
              <View style={s.sessionDivider} />
              <View style={s.sessionClient}>
                <Text style={s.sessionClientName}>{b.users?.name || 'Klient'}</Text>
                <Text style={s.sessionClientTag}>Pervaya sessiya</Text>
              </View>
              <View style={[s.statusBadge, b.status === 'confirmed' && s.statusGreen]}>
                <Text style={s.statusText}>{b.status === 'confirmed' ? 'OK' : 'Skoro'}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2447' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F2447' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 24, paddingTop: 60 },
  greeting: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 3 },
  title: { fontSize: 23, fontWeight: '500', color: '#fff' },
  photoContainer: { width: 46, height: 46, borderRadius: 16, backgroundColor: 'rgba(201,168,76,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(201,168,76,0.4)' },
  photoText: { fontSize: 22 },
  statsRow: { flexDirection: 'row', gap: 9, paddingHorizontal: 24, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 17, padding: 13, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statValue: { fontSize: 23, fontWeight: '600', color: '#fff', marginBottom: 3 },
  statValueGold: { color: '#C9A84C', fontSize: 18 },
  statLabel: { fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.8 },
  actionsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 24, marginBottom: 16 },
  actionBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  actionBtnIcon: { fontSize: 22, marginBottom: 6 },
  actionBtnText: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  section: { paddingHorizontal: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 10, letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
  sectionDate: { fontSize: 10, color: '#C9A84C', fontWeight: '700' },
  noSessions: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 20 },
  sessionItem: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)' },
  sessionTime: { alignItems: 'center', minWidth: 46 },
  sessionTimeText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  sessionDur: { fontSize: 8, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  sessionDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.12)' },
  sessionClient: { flex: 1 },
  sessionClientName: { fontSize: 12, fontWeight: '700', color: '#fff', marginBottom: 2 },
  sessionClientTag: { fontSize: 9, color: 'rgba(255,255,255,0.4)' },
  statusBadge: { backgroundColor: 'rgba(212,160,85,0.15)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(212,160,85,0.25)' },
  statusGreen: { backgroundColor: 'rgba(76,175,125,0.18)', borderColor: 'rgba(76,175,125,0.25)' },
  statusText: { fontSize: 9, fontWeight: '700', color: '#C9A84C' },
});