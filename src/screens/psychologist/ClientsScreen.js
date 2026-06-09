import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, ActivityIndicator,
} from 'react-native';
import { supabase } from '../../services/supabase';

export default function ClientsScreen({ navigation }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*, users(*), time_slots(*)')
        .order('created_at', { ascending: false });

      const unique = [];
      const seen   = new Set();
      (data || []).forEach(b => {
        if (b.users?.id && !seen.has(b.users.id)) {
          seen.add(b.users.id);
          unique.push(b.users);
        }
      });
      setClients(unique);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={s.clientCard} onPress={() => navigation.navigate('PsychChat', { clientId: item.id, clientName: item.name })}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{item.name?.[0]?.toUpperCase() || '?'}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.clientName}>{item.name || 'Клиент'}</Text>
        <Text style={s.clientEmail}>{item.phone}</Text>
      </View>
      <Text style={s.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Клиенты</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color="#C9A84C" /></View>
      ) : clients.length === 0 ? (
        <View style={s.center}>
          <Text style={s.emptyIcon}>👤</Text>
          <Text style={s.emptyText}>Нет клиентов</Text>
        </View>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2447' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16 },
  back: { color: '#C9A84C', fontSize: 22, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: 'rgba(255,255,255,0.3)', fontSize: 15 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  clientCard: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#2E5DA6', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  clientName: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 3 },
  clientEmail: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  arrow: { color: '#C9A84C', fontSize: 24 },
});