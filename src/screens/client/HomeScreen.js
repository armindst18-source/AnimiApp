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
import { getClientBookings } from '../../services/booking';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [nextBooking, setNextBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const { data } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single();
      setUser({ ...user, name: data?.name });
      const bookings = await getClientBookings(user.id);
      const upcoming = bookings?.find(b =>
        b.status === 'confirmed' && new Date(b.time_slots?.date) >= new Date()
      );
      setNextBooking(upcoming);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#1A3D7C" />
      </View>
    );
  }

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Dobro pozhalovat</Text>
          <Text style={s.name}>{user?.name || 'Klient'}</Text>
        </View>
        <TouchableOpacity style={s.avatar} onPress={handleSignOut}>
          <Text style={s.avatarText}>
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </Text>
        </TouchableOpacity>
      </View>

      {nextBooking ? (
        <View style={s.sessionCard}>
          <Text style={s.sessionLabel}>SLEDUYUSHCHAYA SESSIYA</Text>
          <Text style={s.sessionDate}>{nextBooking.time_slots?.date}</Text>
          <Text style={s.sessionTime}>
            {nextBooking.time_slots?.start_time} — {nextBooking.time_slots?.end_time} · 1.5 chasa
          </Text>
          <View style={s.sessionRow}>
            <View style={s.badge}>
              <Text style={s.badgeText}>OPLACHENO</Text>
            </View>
            <TouchableOpacity style={s.joinBtn}>
              <Text style={s.joinBtnText}>Podklyuchitsya</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={s.noSessionCard}>
          <Text style={s.noSessionText}>U vas net zapisiey</Text>
          <TouchableOpacity
            style={s.bookNowBtn}
            onPress={() => navigation.navigate('Booking')}
          >
            <Text style={s.bookNowText}>Zapisatsya</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={s.sectionTitle}>BYSTRYYE DEYSTVIYA</Text>
      <View style={s.actions}>
        <TouchableOpacity
          style={s.actionCard}
          onPress={() => navigation.navigate('Booking')}
        >
          <Text style={s.actionIcon}>📅</Text>
          <Text style={s.actionTitle}>Zapisatsya</Text>
          <Text style={s.actionSub}>Vybrat udobnoye vremya</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.actionCard}
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={s.actionIcon}>💬</Text>
          <Text style={s.actionTitle}>Soobshcheniya</Text>
          <Text style={s.actionSub}>Chat s psikhologom</Text>
        </TouchableOpacity>
      </View>

      <View style={s.psychCard}>
        <View style={s.psychPhoto}>
          <Text style={s.psychPhotoText}>👩</Text>
        </View>
        <View style={s.psychInfo}>
          <Text style={s.psychName}>Vash psikholog</Text>
          <Text style={s.psychSpec}>Metod odnoy sessii · onlayn</Text>
          <Text style={s.psychRating}>★ 5.0 · 48 otzyvov</Text>
        </View>
        <TouchableOpacity
          style={s.chatBtn}
          onPress={() => navigation.navigate('Chat')}
        >
          <Text>💬</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4FF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 24, paddingTop: 60 },
  greeting: { fontSize: 12, color: '#6B7A99', marginBottom: 2 },
  name: { fontSize: 26, fontWeight: 'bold', color: '#0F2447' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2E5DA6', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  sessionCard: { marginHorizontal: 24, backgroundColor: '#1A3D7C', borderRadius: 24, padding: 20 },
  sessionLabel: { fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.5)', marginBottom: 8, fontWeight: '600' },
  sessionDate: { fontSize: 26, fontWeight: '500', color: '#fff', marginBottom: 3 },
  sessionTime: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 16 },
  sessionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { backgroundColor: 'rgba(201,168,76,0.2)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.4)', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20 },
  badgeText: { color: '#E8C07A', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  joinBtn: { backgroundColor: '#C9A84C', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 18 },
  joinBtnText: { color: '#0F2447', fontSize: 12, fontWeight: '700' },
  noSessionCard: { marginHorizontal: 24, backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center' },
  noSessionText: { fontSize: 14, color: '#6B7A99', marginBottom: 12 },
  bookNowBtn: { backgroundColor: '#1A3D7C', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 16 },
  bookNowText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 10, letterSpacing: 1.8, color: '#6B7A99', fontWeight: '600', paddingHorizontal: 24, paddingTop: 22, paddingBottom: 10 },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 24 },
  actionCard: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 16, elevation: 2 },
  actionIcon: { fontSize: 24, marginBottom: 8 },
  actionTitle: { fontSize: 13, fontWeight: '700', color: '#0F2447', marginBottom: 2 },
  actionSub: { fontSize: 10, color: '#6B7A99' },
  psychCard: { marginHorizontal: 24, marginTop: 16, backgroundColor: '#fff', borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 2 },
  psychPhoto: { width: 54, height: 54, borderRadius: 18, backgroundColor: '#EBF0FA', justifyContent: 'center', alignItems: 'center' },
  psychPhotoText: { fontSize: 28 },
  psychInfo: { flex: 1 },
  psychName: { fontSize: 14, fontWeight: '700', color: '#0F2447', marginBottom: 2 },
  psychSpec: { fontSize: 10, color: '#6B7A99', marginBottom: 4 },
  psychRating: { fontSize: 10, color: '#C9A84C', fontWeight: '700' },
  chatBtn: { width: 36, height: 36, backgroundColor: 'rgba(26,61,124,0.1)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});