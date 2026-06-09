import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { TEXTS } from '../auth/WelcomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(true);
  const [lang, setLang]       = useState('ru');
  const [history, setHistory] = useState([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const l = await AsyncStorage.getItem('lang') || 'ru';
    setLang(l);
    const { data: { user } } = await supabase.auth.getUser();
    setEmail(user?.email || '');
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
    setProfile(data);
    const { data: bk } = await supabase
      .from('bookings')
      .select('*, time_slots(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setHistory(bk || []);
    setLoading(false);
  };

  const t = TEXTS[lang];
  const initial = profile?.name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || 'A';

  const handleLogout = () => {
    Alert.alert(t.logout, lang === 'ru' ? 'Вы уверены?' : 'Are you sure?', [
      { text: lang === 'ru' ? 'Отмена' : 'Cancel', style: 'cancel' },
      { text: lang === 'ru' ? 'Выйти' : 'Log out', style: 'destructive',
        onPress: async () => { await supabase.auth.signOut(); } },
    ]);
  };

  if (loading) return <View style={s.loader}><ActivityIndicator size="large" color="#1A3D7C" /></View>;

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
          <Text style={s.backTxt}>← {lang === 'ru' ? 'Назад' : 'Back'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.myProfile}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={s.avatarWrap}>
        <View style={s.avatar}><Text style={s.avatarTxt}>{initial}</Text></View>
        <Text style={s.profileName}>{profile?.name || '—'}</Text>
        <Text style={s.profileEmail}>{email}</Text>
      </View>

      <View style={s.card}>
        <View style={s.row}><Text style={s.lbl}>{t.name}</Text><Text style={s.val}>{profile?.name || '—'}</Text></View>
        <View style={s.sep} />
        <View style={s.row}><Text style={s.lbl}>Email</Text><Text style={s.val}>{email}</Text></View>
        <View style={s.sep} />
        <View style={s.row}><Text style={s.lbl}>{t.phone}</Text><Text style={s.val}>{profile?.phone || '—'}</Text></View>
      </View>

      {history.length > 0 && (
        <View style={s.historySection}>
          <Text style={s.historyTitle}>{t.history}</Text>
          {history.map(b => (
            <View key={b.id} style={s.historyItem}>
              <Text style={s.historyDate}>{b.time_slots?.date}</Text>
              <Text style={s.historyTime}>{b.time_slots?.start_time} — {b.time_slots?.end_time}</Text>
              <View style={[s.historyBadge, b.status === 'confirmed' && s.historyBadgeOk]}>
                <Text style={s.historyBadgeText}>{b.status === 'confirmed' ? t.paid : t.pending}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutTxt}>🚪 {t.logout}</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#F0F4FF'},
  loader:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#F0F4FF'},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:24,paddingTop:56},
  back:{padding:4},backTxt:{color:'#1A3D7C',fontSize:14,fontWeight:'600'},
  headerTitle:{fontSize:16,fontWeight:'700',color:'#0F2447'},
  avatarWrap:{alignItems:'center',paddingVertical:28},
  avatar:{width:84,height:84,borderRadius:42,backgroundColor:'#1A3D7C',justifyContent:'center',alignItems:'center',marginBottom:14,elevation:8},
  avatarTxt:{color:'#fff',fontSize:34,fontWeight:'700'},
  profileName:{fontSize:20,fontWeight:'700',color:'#0F2447',marginBottom:4},
  profileEmail:{fontSize:13,color:'#6B7A99'},
  card:{marginHorizontal:20,backgroundColor:'#fff',borderRadius:18,overflow:'hidden',elevation:3},
  row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16},
  lbl:{color:'#6B7A99',fontSize:14},val:{fontWeight:'600',color:'#0F2447',fontSize:14,maxWidth:'60%',textAlign:'right'},
  sep:{height:1,backgroundColor:'#F0F4FF',marginHorizontal:16},
  historySection:{marginHorizontal:20,marginTop:20},
  historyTitle:{fontSize:11,letterSpacing:1.5,color:'#6B7A99',fontWeight:'700',marginBottom:12},
  historyItem:{backgroundColor:'#fff',borderRadius:14,padding:14,marginBottom:8,elevation:1},
  historyDate:{fontSize:14,fontWeight:'700',color:'#0F2447',marginBottom:2},
  historyTime:{fontSize:12,color:'#6B7A99',marginBottom:8},
  historyBadge:{backgroundColor:'rgba(239,68,68,0.1)',borderRadius:8,paddingHorizontal:10,paddingVertical:4,alignSelf:'flex-start'},
  historyBadgeOk:{backgroundColor:'rgba(34,197,94,0.1)'},
  historyBadgeText:{fontSize:10,fontWeight:'700',color:'#DC2626'},
  logoutBtn:{margin:20,marginTop:24,backgroundColor:'#FEE2E2',borderRadius:14,padding:16,alignItems:'center'},
  logoutTxt:{color:'#DC2626',fontWeight:'700',fontSize:15},
});