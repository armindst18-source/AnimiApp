import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, FlatList, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { supabase } from '../../services/supabase';

export default function PsychChatScreen({ navigation, route }) {
  const { clientId, clientName } = route.params || {};
  const [messages, setMessages]   = useState([]);
  const [text, setText]           = useState('');
  const [userId, setUserId]       = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const flatRef = useRef(null);

  useEffect(() => {
    init();
    return () => { supabase.removeAllChannels(); };
  }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user.id);
    const { data: bk } = await supabase
      .from('bookings').select('id').eq('user_id', clientId)
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
    supabase.channel('psych-chat-' + bId)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public',
        table: 'messages', filter: 'booking_id=eq.' + bId,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      }).subscribe();
  };

  const sendMessage = async () => {
    if (!text.trim() || !bookingId) return;
    setSending(true);
    const msg = text.trim();
    setText('');
    await supabase.from('messages').insert({
      booking_id: bookingId, sender_id: userId, content: msg,
    });
    setSending(false);
  };

  if (loading) return (
    <View style={s.loader}><ActivityIndicator size="large" color="#C9A84C" /></View>
  );

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <View style={s.headerInfo}>
          <Text style={s.headerTitle}>{clientName || 'Клиент'}</Text>
          <Text style={s.headerSub}>Чат с клиентом</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={m => m.id}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={s.messagesList}
        ListEmptyComponent={<Text style={s.noMessages}>Нет сообщений</Text>}
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
          placeholder="Написать сообщение..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          style={s.sendBtn}
          onPress={sendMessage}
          disabled={sending || !text.trim()}
        >
          {sending
            ? <ActivityIndicator color="#0F2447" size="small" />
            : <Text style={s.sendBtnText}>↑</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2447' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F2447' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  back: { color: '#C9A84C', fontSize: 22, fontWeight: '700' },
  headerInfo: { alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
  messagesList: { padding: 16, gap: 8, flexGrow: 1, justifyContent: 'flex-end' },
  noMessages: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 60, fontSize: 14 },
  bubble: { maxWidth: '78%', borderRadius: 18, padding: 12, marginBottom: 6 },
  bubbleMe: { backgroundColor: '#C9A84C', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  bubbleTextMe: { color: '#0F2447' },
  bubbleTime: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, textAlign: 'right' },
  bubbleTimeMe: { color: 'rgba(15,36,71,0.5)' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, paddingBottom: 28, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', gap: 10 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#fff', maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#C9A84C', justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: '#0F2447', fontSize: 18, fontWeight: '700' },
});