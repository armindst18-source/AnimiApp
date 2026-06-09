import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { supabase } from '../../services/supabase';
import { TEXTS } from '../auth/WelcomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatScreen({ navigation }) {
  const [lang, setLang]       = useState('ru');
  const [messages, setMessages] = useState([]);
  const [text, setText]       = useState('');
  const [userId, setUserId]   = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatRef = useRef(null);

  useEffect(() => {
    init();
    return () => { supabase.removeAllChannels(); };
  }, []);

  const init = async () => {
    const l = await AsyncStorage.getItem('lang') || 'ru';
    setLang(l);
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user.id);
    const { data: bk } = await supabase
      .from('bookings').select('id').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(1).single();
    if (bk) {
      setBookingId(bk.id);
      await loadMessages(bk.id);
      subscribeMessages(bk.id);
    }
    setLoading(false);
  };

  const loadMessages = async (bId) => {
    const { data } = await supabase
      .from('messages').select('*').eq('booking_id', bId).order('created_at');
    setMessages(data || []);
  };

  const subscribeMessages = (bId) => {
    supabase.channel('chat-' + bId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'booking_id=eq.' + bId },
        (payload) => { setMessages(prev => [...prev, payload.new]); }
      ).subscribe();
  };

  const sendMessage = async () => {
    if (!text.trim() || !bookingId) return;
    setSending(true);
    const msg = text.trim();
    setText('');
    await supabase.from('messages').insert({ booking_id: bookingId, sender_id: userId, content: msg });
    setSending(false);
  };

  const t = TEXTS[lang];

  if (loading) return <View style={s.loader}><ActivityIndicator size="large" color="#1A3D7C" /></View>;

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.headerTitle}>{t.myPsych}</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={m => m.id}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={s.messagesList}
        ListEmptyComponent={<Text style={s.noMessages}>{t.noMessages}</Text>}
        renderItem={({ item }) => {
          const isMe = item.sender_id === userId;
          return (
            <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleThem]}>
              <Text style={[s.bubbleText, isMe && s.bubbleTextMe]}>{item.content}</Text>
              <Text style={[s.bubbleTime, isMe && s.bubbleTimeMe]}>
                {new Date(item.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        }}
      />

      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder={t.typeMessage}
          placeholderTextColor="#9BA8C0"
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={s.sendBtn} onPress={sendMessage} disabled={sending || !text.trim()}>
          {sending ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={s.sendBtnText}>↑</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#F0F4FF'},
  loader:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#F0F4FF'},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:24,paddingTop:56,paddingBottom:12,backgroundColor:'#fff',elevation:2},
  back:{color:'#1A3D7C',fontSize:22,fontWeight:'700'},
  headerTitle:{fontSize:15,fontWeight:'700',color:'#0F2447'},
  messagesList:{padding:16,gap:8,flexGrow:1,justifyContent:'flex-end'},
  noMessages:{color:'#9BA8C0',textAlign:'center',marginTop:60,fontSize:14},
  bubble:{maxWidth:'78%',borderRadius:18,padding:12,marginBottom:6},
  bubbleMe:{backgroundColor:'#1A3D7C',alignSelf:'flex-end',borderBottomRightRadius:4},
  bubbleThem:{backgroundColor:'#fff',alignSelf:'flex-start',borderBottomLeftRadius:4,elevation:1},
  bubbleText:{color:'#0F2447',fontSize:14,lineHeight:20},
  bubbleTextMe:{color:'#fff'},
  bubbleTime:{fontSize:10,color:'rgba(0,0,0,0.3)',marginTop:4,textAlign:'right'},
  bubbleTimeMe:{color:'rgba(255,255,255,0.5)'},
  inputRow:{flexDirection:'row',alignItems:'flex-end',padding:12,paddingBottom:24,backgroundColor:'#fff',gap:10,elevation:8},
  input:{flex:1,backgroundColor:'#F0F4FF',borderRadius:20,paddingHorizontal:16,paddingVertical:10,fontSize:14,color:'#0F2447',maxHeight:100},
  sendBtn:{width:42,height:42,borderRadius:21,backgroundColor:'#1A3D7C',justifyContent:'center',alignItems:'center',elevation:4},
  sendBtnText:{color:'#fff',fontSize:18,fontWeight:'700'},
});