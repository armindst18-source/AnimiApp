import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, ActivityIndicator, TextInput,
  Alert, Modal,
} from 'react-native';
import { supabase } from '../../services/supabase';

export default function ClientsScreen({ navigation }) {
  const [clients, setClients]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedClient, setSelectedClient] = useState(null);
  const [note, setNote]               = useState('');
  const [savingNote, setSavingNote]   = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [psychId, setPsychId]         = useState(null);

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setPsychId(user.id);
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
    setLoading(false);
  };

  const openNoteModal = async (client) => {
    setSelectedClient(client);
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('psych_notes')
      .select('note')
      .eq('psychologist_id', user.id)
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    setNote(data?.note || '');
    setModalVisible(true);
  };

  const saveNote = async () => {
    if (!note.trim()) return;
    setSavingNote(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('psych_notes').upsert({
      psychologist_id: user.id,
      client_id: selectedClient.id,
      note: note.trim(),
      updated_at: new Date().toISOString(),
    });
    setSavingNote(false);
    setModalVisible(false);
    Alert.alert('✅', 'Заметка сохранена');
  };

  const renderItem = ({ item }) => (
    <View style={s.clientCard}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{item.name?.[0]?.toUpperCase() || '?'}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.clientName}>{item.name || 'Клиент'}</Text>
        <Text style={s.clientEmail}>{item.phone}</Text>
      </View>
      <TouchableOpacity style={s.noteBtn} onPress={() => openNoteModal(item)}>
        <Text style={s.noteBtnText}>📝</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={s.chatBtn}
        onPress={() => navigation.navigate('PsychChat', {
          clientId: item.id,
          clientName: item.name,
        })}
      >
        <Text style={s.chatBtnText}>💬</Text>
      </TouchableOpacity>
    </View>
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

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>📝 Заметка — {selectedClient?.name}</Text>
            <TextInput
              style={s.noteInput}
              placeholder="Личные заметки о клиенте..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={6}
            />
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={s.modalCancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalSave} onPress={saveNote} disabled={savingNote}>
                {savingNote
                  ? <ActivityIndicator color="#0F2447" size="small" />
                  : <Text style={s.modalSaveText}>Сохранить</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  clientCard: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#2E5DA6', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  clientName: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 3 },
  clientEmail: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  noteBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(201,168,76,0.15)', justifyContent: 'center', alignItems: 'center' },
  noteBtnText: { fontSize: 16 },
  chatBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(46,93,166,0.2)', justifyContent: 'center', alignItems: 'center' },
  chatBtnText: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#0d1829', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16 },
  noteInput: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 14, color: '#fff', fontSize: 14, lineHeight: 22, minHeight: 120, textAlignVertical: 'top', marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 14, alignItems: 'center' },
  modalCancelText: { color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  modalSave: { flex: 1, backgroundColor: '#C9A84C', borderRadius: 12, padding: 14, alignItems: 'center' },
  modalSaveText: { color: '#0F2447', fontWeight: '800' },
});