import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { TEXTS } from '../auth/WelcomeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PHASES = [
  { key: 'inhale',  duration: 4000 },
  { key: 'hold',   duration: 4000 },
  { key: 'exhale', duration: 6000 },
];

export default function BreathingScreen({ navigation }) {
  const [lang, setLang]         = useState('ru');
  const [running, setRunning]   = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [counter, setCounter]   = useState(4);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;
  const animRef   = useRef(null);
  const timerRef  = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem('lang').then(l => setLang(l || 'ru'));
    return () => { clearAll(); };
  }, []);

  const clearAll = () => {
    if (animRef.current)  { animRef.current.stop(); }
    if (timerRef.current) { clearInterval(timerRef.current); }
  };

  const runPhase = (idx) => {
    const phase = PHASES[idx % PHASES.length];
    const isInhale = phase.key === 'inhale';
    const isHold   = phase.key === 'hold';
    const secs = phase.duration / 1000;
    setPhaseIdx(idx % PHASES.length);
    setCounter(secs);

    if (timerRef.current) clearInterval(timerRef.current);
    let c = secs;
    timerRef.current = setInterval(() => {
      c -= 1;
      setCounter(c);
      if (c <= 0) { clearInterval(timerRef.current); }
    }, 1000);

    if (animRef.current) animRef.current.stop();
    const toScale   = isInhale ? 1.6 : isHold ? 1.6 : 1;
    const toOpacity = isInhale ? 1   : isHold ? 1   : 0.5;
    animRef.current = Animated.parallel([
      Animated.timing(scaleAnim,   { toValue: toScale,   duration: phase.duration, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: toOpacity, duration: phase.duration, useNativeDriver: true }),
    ]);
    animRef.current.start(({ finished }) => {
      if (finished) runPhase(idx + 1);
    });
  };

  const handleStart = () => { setRunning(true); runPhase(0); };
  const handleStop  = () => { setRunning(false); clearAll(); scaleAnim.setValue(1); opacityAnim.setValue(0.5); setPhaseIdx(0); setCounter(4); };

  const t = TEXTS[lang];
  const phaseLabels = { inhale: t.breathInhale, hold: t.breathHold, exhale: t.breathExhale };
  const currentLabel = phaseLabels[PHASES[phaseIdx].key];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>{t.breathTitle}</Text>
        <View style={{ width: 32 }} />
      </View>

      <Text style={s.sub}>{t.breathSub}</Text>

      <View style={s.circleWrap}>
        <Animated.View style={[s.circleOuter, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]} />
        <View style={s.circleInner}>
          {running ? (
            <>
              <Text style={s.circleLabel}>{currentLabel}</Text>
              <Text style={s.circleCount}>{counter}</Text>
            </>
          ) : (
            <Text style={s.circleReady}>∞</Text>
          )}
        </View>
      </View>

      <TouchableOpacity style={[s.btn, running && s.btnStop]} onPress={running ? handleStop : handleStart}>
        <Text style={s.btnText}>{running ? t.breathStop : t.breathStart}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0F2447',alignItems:'center'},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:24,paddingTop:56,paddingBottom:8,width:'100%'},
  back:{color:'#C9A84C',fontSize:22},
  title:{color:'#fff',fontSize:16,fontWeight:'700'},
  sub:{color:'rgba(255,255,255,0.4)',fontSize:13,marginBottom:60,marginTop:8},
  circleWrap:{justifyContent:'center',alignItems:'center',marginBottom:60},
  circleOuter:{width:220,height:220,borderRadius:110,backgroundColor:'rgba(201,168,76,0.15)',borderWidth:2,borderColor:'rgba(201,168,76,0.3)',position:'absolute'},
  circleInner:{width:160,height:160,borderRadius:80,backgroundColor:'rgba(46,93,166,0.2)',borderWidth:1.5,borderColor:'rgba(46,93,166,0.4)',justifyContent:'center',alignItems:'center'},
  circleLabel:{color:'#fff',fontSize:14,fontWeight:'600',marginBottom:4},
  circleCount:{color:'#C9A84C',fontSize:36,fontWeight:'900'},
  circleReady:{color:'rgba(255,255,255,0.3)',fontSize:48},
  btn:{backgroundColor:'#C9A84C',borderRadius:18,paddingHorizontal:48,paddingVertical:16,elevation:6},
  btnStop:{backgroundColor:'rgba(239,68,68,0.7)'},
  btnText:{color:'#0F2447',fontSize:16,fontWeight:'800'},
});