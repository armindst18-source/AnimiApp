import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { getAllBookings } from '../../services/booking';

export default function ClientsScreen({ navigation }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const bookings = await getAllBookings();
      const unique = {};
      bookings?.forEach(b => {
        if (b.users && !unique[b.users.id]) {
          unique[b.users.id] = {
            ...b.users,
            lastSession: b.time_slots?.date,
            totalSessions: 0,
            bookingId: b.id,
          };
        }
        if (b.users) unique[b.users.id].totalSessions++;
      });
      setClients(Object.values(unique));
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

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Moi klienty</Text>
      </View>

      {clients.length === 0 ? (
        <Text style={s.noClients}>Klientov poka net</Text>
      ) : (
        clients.map(client => (
          <View key={client.id} style={s.clientCard}>
            <View style={s.clientAvatar}>
              <Text style={s.clientAvatarText}>
                {client.name ? client.name[0].toUpperCase() : 'K'}
              </Text>
            </View>
            <View style={s.clientInfo}>
              <Text style={s.clientName}>{client.name || 'Klient'}</Text>
              <Text style={s.clientMeta}>
                {client.totalSessions} sessiy · posled. {client.lastSession || '—'}
              </Text>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2447' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F2447' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 24, paddingTop: 60 },
  backBtn: { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  backBtnText: { fontSize: 18, color: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  noClients: { color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 40 },
  clientCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 24, marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  clientAvatar: { width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(201,168,76,0.2)', justifyContent: 'center', alignItems: 'center' },
  clientAvatarText: { fontSize: 20, fontWeight: 'bold', color: '#C9A84C' },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 3 },
  clientMeta: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
});