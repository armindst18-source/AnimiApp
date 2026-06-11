import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { TEXTS } from '../auth/WelcomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PHASES = [
  { key: 'inhale',  duration: 4000 },
  { key: 'hold',   duration: 4000 },
  { key: 'exhale', duration: 6000 },
];

export default function BreathingScreen({ navigation, route }) {
  const { bookingId, lang: routeLang, autoMode = true } = route.params || {};
  const [lang, setLang]         = useState(routeLang || 'ru');
  const [totalLeft, setTotalLeft] = useState(30);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseCount, setPhaseCount] = useState(4);
  const [started, setStarted]   = useState(false);

  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;
  const animRef     = useRef(null);
  const totalRef    = useRef(null);
  const phaseRef    = useRef(null);

  useEffect(() => {
    if (!routeLang) {
      AsyncStorage.getItem('lang').then(l => setLang(l || 'ru'));
    }
    startSession();
    return () => clearAll();
  }, []);

  const clearAll = () => {
    if (animRef.current)  animRef.current.stop();
    if (totalRef.current) clearInterval(totalRef.current);
    if (phaseRef.current) clearInterval(phaseRef.current);
  };

  const startSession = () => {
    setStarted(true);
    totalRef.current = setInterval(() => {
      setTotalLeft(prev => {
        if (prev <= 1) {
          clearAll();
          if (autoMode && bookingId) {
            navigation.replace('Video', { bookingId });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    runPhase(0);
  };

  const runPhase = (idx) => {
    const phase = PHASES[idx % PHASES.length];
    setPhaseIdx(idx % PHASES.length);
    setPhaseCount(phase.duration / 1000);

    if (phaseRef.current) clearInterval(phaseRef.current);
    let c = phase.duration / 1000;
    phaseRef.current = setInterval(() => {
      c -= 1;
      setPhaseCount(c);
      if (c <= 0) clearInterval(phaseRef.current);
    }, 1000);

    if (animRef.current) animRef.current.stop();
    const isInhale = phase.key === 'inhale';
    const isHold   = phase.key === 'hold';
    animRef.current = Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: isInhale ? 1.6 : isHold ? 1.6 : 1,
        duration: phase.duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: isInhale ? 1 : isHold ? 1 : 0.5,
        duration: phase.duration,
        useNativeDriver: true,
      }),
    ]);
    animRef.current.start(({ finished }) => {
      if (finished) runPhase(idx + 1);
    });
  };

  const t = TEXTS[lang];
  const phaseLabels = {
    inhale: t.breathInhale,
    hold:   t.breathHold,
    exhale: t.breathExhale,
  };

  return (
    <View style={s.container}>
      <View style={s.topSection}>
        <Text style={s.title}>{t.breathTitle}</Text>
        <Text style={s.desc}>{t.breathDesc}</Text>
      </View>

      <View style={s.circleWrap}>
        <Animated.View style={[s.circleOuter, {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }]} />
        <View style={s.circleInner}>
          <Text style={s.phaseLabel}>
            {phaseLabels[PHASES[phaseIdx].key]}
          </Text>
          <Text style={s.phaseCount}>{phaseCount}</Text>
        </View>
      </View>

      <View style={s.bottomSection}>
        <Text style={s.countdownLabel}>{t.breathStarting}</Text>
        <Text style={s.countdown}>{totalLeft}</Text>
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${(totalLeft / 30) * 100}%` }]} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2447', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 60, paddingHorizontal: 28 },
  topSection: { alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 10, textAlign: 'center' },
  desc: { fontSize: 13, color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 20 },
  circleWrap: { justifyContent: 'center', alignItems: 'center' },
  circleOuter: { width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(201,168,76,0.12)', borderWidth: 2, borderColor: 'rgba(201,168,76,0.25)', position: 'absolute' },
  circleInner: { width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(46,93,166,0.2)', borderWidth: 1.5, borderColor: 'rgba(46,93,166,0.4)', justifyContent: 'center', alignItems: 'center' },
  phaseLabel: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  phaseCount: { color: '#C9A84C', fontSize: 40, fontWeight: '900' },
  bottomSection: { alignItems: 'center', width: '100%' },
  countdownLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 1, marginBottom: 6 },
  countdown: { color: '#fff', fontSize: 52, fontWeight: '900', marginBottom: 16 },
  progressBar: { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: '#C9A84C', borderRadius: 2 },
});