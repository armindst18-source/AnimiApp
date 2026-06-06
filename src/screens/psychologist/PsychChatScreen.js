import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { getMessages, sendMessage, subscribeToMessages } from '../../services/messages';

export default function PsychChatScreen({ route, navigation }) {
  const { bookingId } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => { init(); }, []);

  const init = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user.id);
      if (bookingId) {
        const msgs = await getMessages(bookingId);
        setMessages(msgs || []);
        const channel = subscribeToMessages(bookingId, (newMsg) => {
          setMessages(prev => [...prev, newMsg]);
          setTimeout(() => scrollRef.current?.scrollToEnd(), 100);
        });
        return () => supabase.removeChannel(channel);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || !bookingId) return;
    setSending(true);
    try {
      const msg = await sendMessage(bookingId, userId, text.trim());
      setMessages(prev => [...prev, msg]);
      setText('');
      setTimeout(() => scrollRef.current?.scrollToEnd(), 100);
    } catch (e) {
      console.log(e);
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color="#C9A84C" />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerName}>Chat s klientom</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={s.messages}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
      >
        {messages.length === 0 ? (
          <Text style={s.noMessages}>Nachinte perepisku</Text>
        ) : (
          messages.map(msg => (
            <View key={msg.id}
              style={[s.bubble, msg.sender_id === userId ? s.bubbleOwn : s.bubbleOther]}>
              <Text style={[s.bubbleText, msg.sender_id === userId && s.bubbleTextOwn]}>
                {msg.content}
              </Text>
              <Text style={[s.bubbleTime, msg.sender_id === userId && s.bubbleTimeOwn]}>
                {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder="Napisite soobshcheniye..."
          placeholderTextColor="rgba(255,255,255,0.35)"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity style={s.sendBtn} onPress={handleSend} disabled={sending}>
          {sending
            ? <ActivityIndicator color="#0F2447" size="small" />
            : <Text style={s.sendBtnText}>→</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2447' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F2447' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 24, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  backBtnText: { fontSize: 18, color: '#fff' },
  headerName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  messages: { flex: 1, padding: 16 },
  noMessages: { textAlign: 'center', color: 'rgba(255,255,255,0.35)', marginTop: 60, fontSize: 14 },
  bubble: { maxWidth: '78%', borderRadius: 18, padding: 12, marginBottom: 8 },
  bubbleOwn: { alignSelf: 'flex-end', backgroundColor: '#C9A84C' },
  bubbleOther: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.1)' },
  bubbleText: { fontSize: 14, color: '#fff', lineHeight: 20 },
  bubbleTextOwn: { color: '#0F2447' },
  bubbleTime: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, alignSelf: 'flex-end' },
  bubbleTimeOwn: { color: 'rgba(15,36,71,0.55)' },
  inputRow: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#fff', maxHeight: 100 },
  sendBtn: { width: 46, height: 46, backgroundColor: '#C9A84C', borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: '#0F2447', fontSize: 20, fontWeight: 'bold' },
});