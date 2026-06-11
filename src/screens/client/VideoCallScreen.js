import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';

export default function VideoCallScreen({ navigation, route }) {
  const { bookingId, lang = 'ru' } = route.params || {};
  const [loading, setLoading] = useState(true);
  const webRef = useRef(null);

  const roomName = 'animinava-session-' + (bookingId || 'default');
  const jitsiUrl = `https://meet.jit.si/${roomName}#config.startWithAudioMuted=false&config.startWithVideoMuted=false&interfaceConfig.SHOW_JITSI_WATERMARK=false`;

  const handleEnd = () => {
    Alert.alert(
      lang === 'ru' ? 'Завершить сессию?' : 'End session?',
      lang === 'ru' ? 'Вы уверены?' : 'Are you sure?',
      [
        { text: lang === 'ru' ? 'Отмена' : 'Cancel', style: 'cancel' },
        {
          text: lang === 'ru' ? 'Завершить' : 'End',
          style: 'destructive',
          onPress: () => navigation.replace('Rating', { bookingId, lang }),
        },
      ]
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.liveRow}>
          <View style={s.liveDot} />
          <Text style={s.liveText}>LIVE</Text>
        </View>
        <Text style={s.headerTitle}>{lang === 'ru' ? 'Сессия' : 'Session'}</Text>
        <TouchableOpacity style={s.endBtn} onPress={handleEnd}>
          <Text style={s.endBtnText}>{lang === 'ru' ? 'Завершить' : 'End'}</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator size="large" color="#C9A84C" />
          <Text style={s.loadingText}>{lang === 'ru' ? 'Подключение...' : 'Connecting...'}</Text>
        </View>
      )}

      <WebView
        ref={webRef}
        source={{ uri: jitsiUrl }}
        style={s.webview}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          Alert.alert(
            lang === 'ru' ? 'Ошибка' : 'Error',
            lang === 'ru' ? 'Не удалось подключиться.' : 'Could not connect.'
          );
        }}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2447' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12, backgroundColor: '#0F2447' },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  liveText: { color: '#ef4444', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  endBtn: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  endBtnText: { color: '#f87171', fontSize: 12, fontWeight: '700' },
  webview: { flex: 1 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0F2447', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  loadingText: { color: 'rgba(255,255,255,0.5)', marginTop: 12, fontSize: 14 },
});