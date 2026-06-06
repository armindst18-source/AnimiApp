import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

const PHASES = [
  { label: 'Vdokh', seconds: 4, color: '#2E5DA6', toScale: 1.5 },
  { label: 'Zaderzhka', seconds: 4, color: '#C9A84C', toScale: 1.5 },
  { label: 'Vydokh', seconds: 6, color: '#2D7A4F', toScale: 0.7 },
];

export default function BreathingScreen({ navigation }) {
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [countdown, setCountdown] = useState(PHASES[0].seconds);
  const [done, setDone] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  const animRef = useRef(null);

  const stopAll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animRef.current) animRef.current.stop();
  };

  useEffect(() => () => stopAll(), []);

  const runPhase = (pIdx, currentCycle) => {
    const phase = PHASES[pIdx];
    setPhaseIndex(pIdx);
    setCountdown(phase.seconds);

    animRef.current = Animated.timing(scale, {
      toValue: phase.toScale,
      duration: phase.seconds * 1000,
      useNativeDriver: true,
    });
    animRef.current.start();

    let remaining = phase.seconds;
    timerRef.current = setInterval(() => {
      remaining--;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        const nextPhase = (pIdx + 1) % PHASES.length;
        const newCycle = nextPhase === 0 ? currentCycle + 1 : currentCycle;
        setCycle(newCycle);
        if (newCycle >= 4) {
          setRunning(false);
          setDone(true);
          Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }).start();
        } else {
          runPhase(nextPhase, newCycle);
        }
      }
    }, 1000);
  };

  const handleStart = () => {
    setRunning(true);
    setDone(false);
    setCycle(0);
    runPhase(0, 0);
  };

  const handleStop = () => {
    stopAll();
    setRunning(false);
    setPhaseIndex(0);
    setCycle(0);
    setDone(false);
    Animated.timing(scale, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  };

  const phase = PHASES[phaseIndex];

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.backBtn} onPress={() => { stopAll(); navigation.goBack(); }}>
        <Text style={s.backBtnText}>←</Text>
      </TouchableOpacity>

      <Text style={s.title}>Dykhaniye pered sessiyey</Text>
      <Text style={s.subtitle}>4 tsikla dlya rasslableniya</Text>

      <View style={s.circleWrap}>
        <Animated.View
          style={[s.circle, { backgroundColor: phase.color, transform: [{ scale }] }]}
        >
          <Text style={s.phaseLabel}>{done ? '✓' : phase.label}</Text>
          <Text style={s.phaseCount}>{done ? 'Otlichno!' : countdown}</Text>
        </Animated.View>
      </View>

      <Text style={s.cycleText}>{cycle} / 4 tsiklov</Text>

      {!running && !done && (
        <TouchableOpacity style={s.startBtn} onPress={handleStart}>
          <Text style={s.startBtnText}>Nachat dykhaniye</Text>
        </TouchableOpacity>
      )}
      {running && (
        <TouchableOpacity style={s.stopBtn} onPress={handleStop}>
          <Text style={s.stopBtnText}>Ostanovit</Text>
        </TouchableOpacity>
      )}
      {done && (
        <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()}>
          <Text style={s.doneBtnText}>Otlichno! Prodolzhit</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2447', alignItems: 'center', paddingTop: 60 },
  backBtn: { position: 'absolute', top: 56, left: 24, width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  backBtnText: { fontSize: 18, color: '#fff' },
  title: { fontSize: 20, fontWeight: '700', color: '#fff', marginTop: 16, marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 50, textAlign: 'center', paddingHorizontal: 32 },
  circleWrap: { width: 250, height: 250, justifyContent: 'center', alignItems: 'center' },
  circle: { width: 150, height: 150, borderRadius: 75, justifyContent: 'center', alignItems: 'center' },
  phaseLabel: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 6 },
  phaseCount: { fontSize: 38, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  cycleText: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 20, marginBottom: 30 },
  startBtn: { backgroundColor: '#2E5DA6', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 20 },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  stopBtn: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 18 },
  stopBtnText: { color: 'rgba(255,255,255,0.6)', fontSize: 15 },
  doneBtn: { backgroundColor: '#2D7A4F', paddingHorizontal: 36, paddingVertical: 16, borderRadius: 20 },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});