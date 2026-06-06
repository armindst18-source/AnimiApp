import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';

export default function VideoCallScreen({ route, navigation }) {
  const { bookingId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const webviewRef = useRef(null);

  const roomName = `AnimiSession${bookingId || 'Default'}`;
  const jitsiUrl = `https://meet.jit.si/${roomName}`;

  const jitsiConfig = `
    var api = new JitsiMeetExternalAPI('meet.jit.si', {
      roomName: '${roomName}',
      width: '100%',
      height: '100%',
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableDeepLinking: true,
        toolbarButtons: ['microphone', 'camera', 'hangup'],
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: ['microphone', 'camera', 'hangup'],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        DEFAULT_BACKGROUND: '#0F2447',
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
      },
    });
  `;

  if (error) return (
    <View style={s.center}>
      <Text style={s.errorIcon}>📵</Text>
      <Text style={s.errorText}>Ne udalos podklyuchitsya</Text>
      <Text style={s.errorSub}>Proverte internet-soyedineniye</Text>
      <TouchableOpacity style={s.retryBtn} onPress={() => setError(false)}>
        <Text style={s.retryText}>Povtorit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.backBtn2} onPress={() => navigation.goBack()}>
        <Text style={s.backBtn2Text}>Nazad</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.endBtn} onPress={() => navigation.goBack()}>
          <Text style={s.endBtnText}>📵 Zavershit</Text>
        </TouchableOpacity>
        <Text style={s.topBarTitle}>Sessiya</Text>
        <View style={{ width: 90 }} />
      </View>

      {loading && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator size="large" color="#C9A84C" />
          <Text style={s.loadingText}>Podklyucheniye k sessii...</Text>
        </View>
      )}

      <WebView
        ref={webviewRef}
        source={{ uri: jitsiUrl }}
        style={s.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => { setLoading(false); setError(true); }}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        allowsFullscreenVideo={true}
        injectedJavaScript={jitsiConfig}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2447' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F2447', padding: 32 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 52, backgroundColor: '#0F2447' },
  endBtn: { backgroundColor: '#C0392B', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  endBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  topBarTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  webview: { flex: 1 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F2447', zIndex: 10 },
  loadingText: { color: '#fff', fontSize: 16, marginTop: 16 },
  errorIcon: { fontSize: 60, marginBottom: 20 },
  errorText: { color: '#E07070', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  errorSub: { color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 28 },
  retryBtn: { backgroundColor: '#2E5DA6', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16, marginBottom: 12 },
  retryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  backBtn2: { paddingHorizontal: 24, paddingVertical: 10 },
  backBtn2Text: { color: 'rgba(255,255,255,0.45)', fontSize: 14 },
});