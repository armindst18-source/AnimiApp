import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { getMessages, sendMessage, subscribeToMessages } from '../../services/messages';
import { getClientBookings } from '../../services/booking';

export default function ChatScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user.id);
      const bookings = await getClientBookings(user.id);
      if (bookings && bookings.length > 0) {
        const bId = bookings[0].id;
        setBookingId(bId);
        const msgs = await getMessages(bId);
        setMessages(msgs || []);
        const channel = subscribeToMessages(bId, (newMsg) => {
          setMessages(prev => [...prev, newMsg]);
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

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <ActivityIndicator size="large" color="#1A3D7C" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backBtnText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={s.headerName}>Vash psikholog</Text>
          <Text style={s.headerStatus}>● Onlayn</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={s.messages}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
      >
        {messages.length === 0 ? (
          <Text style={s.noMessages}>Nachните razgovor s psikhologom</Text>
        ) : (
          messages.map(msg => (
            <View
              key={msg.id}
              style={[s.bubble, msg.sender_id === userId ? s.bubbleOwn : s.bubbleOther]}
            >
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
          placeholderTextColor="#9B7B6A"
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity style={s.sendBtn} onPress={handleSend} disabled={sending}>
          {sending
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={s.sendBtnText}>→</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4FF' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 24, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E0E8FF' },
  backBtn: { width: 36, height: 36, backgroundColor: '#EBF0FA', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  backBtnText: { fontSize: 18, color: '#1A3D7C' },
  headerName: { fontSize: 15, fontWeight: '700', color: '#0F2447' },
  headerStatus: { fontSize: 11, color: '#2D7A4F' },
  messages: { flex: 1, padding: 16 },
  noMessages: { textAlign: 'center', color: '#9B7B6A', marginTop: 40 },
  bubble: { maxWidth: '75%', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 8, elevation: 1 },
  bubbleOwn: { alignSelf: 'flex-end', backgroundColor: '#1A3D7C' },
  bubbleOther: { alignSelf: 'flex-start' },
  bubbleText: { fontSize: 14, color: '#333', lineHeight: 20 },
  bubbleTextOwn: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: '#9B7B6A', marginTop: 4, alignSelf: 'flex-end' },
  bubbleTimeOwn: { color: 'rgba(255,255,255,0.6)' },
  inputRow: { flexDirection: 'row', gap: 10, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E0E8FF' },
  input: { flex: 1, backgroundColor: '#F0F4FF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#333', maxHeight: 100 },
  sendBtn: { width: 44, height: 44, backgroundColor: '#1A3D7C', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});