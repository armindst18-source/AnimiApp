import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { TEXTS } from '../auth/WelcomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [user, setUser]             = useState(null);
  const [nextBooking, setNextBooking] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [lang, setLang]             = useState('ru');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const l = await AsyncStorage.getItem('lang') || 'ru';
      setLang(l);
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile }  = await supabase.from('users').select('name').eq('id', user.id).single();
      setUser({ ...user, name: profile?.name });
      const today = new Date().toISOString().split('T')[0];
      const { data: bk } = await supabase
        .from('bookings')
        .select('*, time_slots(*)')
        .eq('user_id', user.id)
        .gte('time_slots.date', today)
        .order('created_at', { ascending: true })
        .limit(1);
      setNextBooking(bk?.[0] || null);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  const t = TEXTS[lang];
  const initial = user?.name?.[0]?.toUpperCase() || 'A';

  if (loading) return (
    <View style={s.loadingContainer}><ActivityIndicator size="large" color="#1A3D7C" /></View>
  );

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{t.welcome},</Text>
          <Text style={s.name}>{user?.name || '—'}</Text>
        </View>
        <TouchableOpacity style={s.avatar} onPress={() => navigation.navigate('Profile')}>
          <Text style={s.avatarText}>{initial}</Text>
        </TouchableOpacity>
      </View>

      {nextBooking ? (
        <View style={s.sessionCard}>
          <Text style={s.sessionLabel}>{t.nextSession}</Text>
          <Text style={s.sessionDate}>{nextBooking.time_slots?.date}</Text>
          <Text style={s.sessionTime}>{nextBooking.time_slots?.start_time} — {nextBooking.time_slots?.end_time} {t.duration}</Text>
          <View style={s.sessionRow}>
            <View style={[s.badge, nextBooking.status === 'pending_payment' && s.badgePending]}>
              <Text style={s.badgeText}>{nextBooking.status === 'confirmed' ? t.paid : t.pending}</Text>
            </View>
            <TouchableOpacity style={s.joinBtn} onPress={() => navigation.navigate('Video', { bookingId: nextBooking.id })}>
              <Text style={s.joinBtnText}>{t.connect}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={s.noSessionCard}>
          <Text style={s.noSessionText}>{t.noSession}</Text>
          <TouchableOpacity style={s.bookNowBtn} onPress={() => navigation.navigate('Booking')}>
            <Text style={s.bookNowText}>{t.bookNow}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={s.sectionTitle}>{t.quickActions}</Text>
      <View style={s.actions}>
        <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate('Booking')}>
          <Text style={s.actionIcon}>📅</Text>
          <Text style={s.actionTitle}>{t.bookNow}</Text>
          <Text style={s.actionSub}>{t.bookTime}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate('Chat')}>
          <Text style={s.actionIcon}>💬</Text>
          <Text style={s.actionTitle}>{t.messages}</Text>
          <Text style={s.actionSub}>{t.myPsych}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionCard} onPress={() => navigation.navigate('Breathing')}>
          <Text style={s.actionIcon}>🌬️</Text>
          <Text style={s.actionTitle}>Дыхание</Text>
          <Text style={s.actionSub}>Расслабление</Text>
        </TouchableOpacity>
      </View>

      <View style={s.psychCard}>
        <View style={s.psychPhoto}><Text style={s.psychPhotoText}>👩</Text></View>
        <View style={s.psychInfo}>
          <Text style={s.psychName}>{t.myPsych}</Text>
          <Text style={s.psychSpec}>{t.method}</Text>
          <Text style={s.psychRating}>★ 5.0</Text>
        </View>
        <TouchableOpacity style={s.chatBtn} onPress={() => navigation.navigate('Chat')}>
          <Text>💬</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#F0F4FF'},
  loadingContainer:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#F0F4FF'},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',padding:24,paddingTop:60},
  greeting:{fontSize:12,color:'#6B7A99',marginBottom:2},
  name:{fontSize:26,fontWeight:'bold',color:'#0F2447'},
  avatar:{width:44,height:44,borderRadius:22,backgroundColor:'#2E5DA6',justifyContent:'center',alignItems:'center'},
  avatarText:{color:'#fff',fontSize:18,fontWeight:'bold'},
  sessionCard:{marginHorizontal:24,backgroundColor:'#1A3D7C',borderRadius:24,padding:20},
  sessionLabel:{fontSize:9,letterSpacing:2,color:'rgba(255,255,255,0.5)',marginBottom:8,fontWeight:'600'},
  sessionDate:{fontSize:26,fontWeight:'500',color:'#fff',marginBottom:3},
  sessionTime:{fontSize:12,color:'rgba(255,255,255,0.6)',marginBottom:16},
  sessionRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  badge:{backgroundColor:'rgba(201,168,76,0.2)',borderWidth:1,borderColor:'rgba(201,168,76,0.4)',paddingHorizontal:11,paddingVertical:5,borderRadius:20},
  badgePending:{backgroundColor:'rgba(239,68,68,0.15)',borderColor:'rgba(239,68,68,0.3)'},
  badgeText:{color:'#E8C07A',fontSize:9,fontWeight:'700',letterSpacing:1},
  joinBtn:{backgroundColor:'#C9A84C',paddingHorizontal:18,paddingVertical:9,borderRadius:18},
  joinBtnText:{color:'#0F2447',fontSize:12,fontWeight:'700'},
  noSessionCard:{marginHorizontal:24,backgroundColor:'#fff',borderRadius:24,padding:20,alignItems:'center'},
  noSessionText:{fontSize:14,color:'#6B7A99',marginBottom:12},
  bookNowBtn:{backgroundColor:'#1A3D7C',paddingHorizontal:24,paddingVertical:10,borderRadius:16},
  bookNowText:{color:'#fff',fontSize:14,fontWeight:'700'},
  sectionTitle:{fontSize:10,letterSpacing:1.8,color:'#6B7A99',fontWeight:'600',paddingHorizontal:24,paddingTop:22,paddingBottom:10},
  actions:{flexDirection:'row',flexWrap:'wrap',gap:12,paddingHorizontal:24},
  actionCard:{width:'47%',backgroundColor:'#fff',borderRadius:20,padding:16,elevation:2},
  actionIcon:{fontSize:24,marginBottom:8},
  actionTitle:{fontSize:13,fontWeight:'700',color:'#0F2447',marginBottom:2},
  actionSub:{fontSize:10,color:'#6B7A99'},
  psychCard:{marginHorizontal:24,marginTop:16,backgroundColor:'#fff',borderRadius:20,padding:14,flexDirection:'row',alignItems:'center',gap:12,elevation:2},
  psychPhoto:{width:54,height:54,borderRadius:18,backgroundColor:'#EBF0FA',justifyContent:'center',alignItems:'center'},
  psychPhotoText:{fontSize:28},
  psychInfo:{flex:1},
  psychName:{fontSize:14,fontWeight:'700',color:'#0F2447',marginBottom:2},
  psychSpec:{fontSize:10,color:'#6B7A99',marginBottom:4},
  psychRating:{fontSize:10,color:'#C9A84C',fontWeight:'700'},
  chatBtn:{width:36,height:36,backgroundColor:'rgba(26,61,124,0.1)',borderRadius:12,justifyContent:'center',alignItems:'center'},
});