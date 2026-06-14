import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Image, StyleSheet,
  Animated, Dimensions, StatusBar,
} from 'react-native';
import Svg, { Line, Rect, Polygon, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const FRAME = width * 0.78;
const FRAME_H = FRAME * 0.85;

export default function SplashScreen({ navigation }) {
  const [stage, setStage] = useState('studio');

  const studioOpacity = useRef(new Animated.Value(0)).current;
  const photoOpacity  = useRef(new Animated.Value(0)).current;
  const photoScale    = useRef(new Animated.Value(0.95)).current;
  const nameOpacity   = useRef(new Animated.Value(0)).current;
  const bioOpacity    = useRef(new Animated.Value(0)).current;
  const animiOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    runStudio();
  }, []);

  const runStudio = () => {
    Animated.sequence([
      Animated.timing(studioOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(studioOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      setStage('photo');
      runPhoto();
    });
  };

  const runPhoto = () => {
    Animated.parallel([
      Animated.timing(photoOpacity,  { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(photoScale,    { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(nameOpacity,   { toValue: 1, duration: 700, delay: 600,  useNativeDriver: true }),
      Animated.timing(bioOpacity,    { toValue: 1, duration: 700, delay: 1000, useNativeDriver: true }),
      Animated.timing(animiOpacity,  { toValue: 1, duration: 700, delay: 1600, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.timing(photoOpacity, { toValue: 0, duration: 600, useNativeDriver: true }).start(() => {
        navigation.replace('Welcome');
      });
    }, 5500);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F2447" />

      {stage === 'studio' && (
        <Animated.View style={[s.studioWrap, { opacity: studioOpacity }]}>
          <Text style={s.studioName}>Armgo</Text>
          <Text style={s.studioSub}>Studio</Text>
          <View style={s.studioDivider}>
            <View style={s.studioDivLine} />
            <View style={s.studioDivDot} />
            <View style={s.studioDivLine} />
          </View>
          <Text style={s.studioTagline}>Crafting digital experiences</Text>
        </Animated.View>
      )}

      {stage === 'photo' && (
        <Animated.View style={[s.photoWrap, { opacity: photoOpacity }]}>

          <Animated.View style={[s.outerFrame, { transform: [{ scale: photoScale }] }]}>

            <View style={s.photoContainer}>
              <Image
                source={require('../../assets/psychologist.png')}
                style={s.photo}
                resizeMode="cover"
              />
              <View style={s.photoGrad} />
            </View>

            <View style={s.svgLayer} pointerEvents="none">
              <Svg width={FRAME + 40} height={FRAME_H + 40}>
                <Line x1="0" y1="20" x2="60" y2="20" stroke="#C9A84C" strokeWidth="1.5" />
                <Line x1="20" y1="0" x2="20" y2="60" stroke="#C9A84C" strokeWidth="1.5" />
                <Line x1={FRAME-20} y1="0" x2={FRAME-20} y2="60" stroke="#C9A84C" strokeWidth="1.5" />
                <Line x1={FRAME-60} y1="20" x2={FRAME+40} y2="20" stroke="#C9A84C" strokeWidth="1.5" />
                <Line x1="0" y1={FRAME_H-20} x2="60" y2={FRAME_H-20} stroke="#C9A84C" strokeWidth="1.5" />
                <Line x1="20" y1={FRAME_H-60} x2="20" y2={FRAME_H+40} stroke="#C9A84C" strokeWidth="1.5" />
                <Line x1={FRAME-20} y1={FRAME_H-60} x2={FRAME-20} y2={FRAME_H+40} stroke="#C9A84C" strokeWidth="1.5" />
                <Line x1={FRAME-60} y1={FRAME_H-20} x2={FRAME+40} y2={FRAME_H-20} stroke="#C9A84C" strokeWidth="1.5" />
                <Polygon points="20,8 28,20 20,32 12,20" fill="none" stroke="#C9A84C" strokeWidth="1" />
                <Polygon points={`${FRAME},8 ${FRAME+8},20 ${FRAME},32 ${FRAME-8},20`} fill="none" stroke="#C9A84C" strokeWidth="1" />
                <Polygon points={`20,${FRAME_H-12} 28,${FRAME_H} 20,${FRAME_H+12} 12,${FRAME_H}`} fill="none" stroke="#C9A84C" strokeWidth="1" />
                <Polygon points={`${FRAME},${FRAME_H-12} ${FRAME+8},${FRAME_H} ${FRAME},${FRAME_H+12} ${FRAME-8},${FRAME_H}`} fill="none" stroke="#C9A84C" strokeWidth="1" />
                <Line x1={FRAME/2-20} y1="20" x2={FRAME/2+20} y2="20" stroke="#2E5DA6" strokeWidth="1" />
                <Line x1={FRAME/2-20} y1={FRAME_H} x2={FRAME/2+20} y2={FRAME_H} stroke="#2E5DA6" strokeWidth="1" />
                <Line x1="20" y1={FRAME_H/2-20} x2="20" y2={FRAME_H/2+20} stroke="#2E5DA6" strokeWidth="1" />
                <Line x1={FRAME} y1={FRAME_H/2-20} x2={FRAME} y2={FRAME_H/2+20} stroke="#2E5DA6" strokeWidth="1" />
                <Circle cx="20" cy="20" r="3" fill="#C9A84C" />
                <Circle cx={FRAME} cy="20" r="3" fill="#C9A84C" />
                <Circle cx="20" cy={FRAME_H} r="3" fill="#C9A84C" />
                <Circle cx={FRAME} cy={FRAME_H} r="3" fill="#C9A84C" />
                <Rect x="20" y="20" width={FRAME-20} height={FRAME_H-20} fill="none" stroke="rgba(201,168,76,0.35)" strokeWidth="1" />
                <Rect x="26" y="26" width={FRAME-32} height={FRAME_H-32} fill="none" stroke="rgba(46,93,166,0.3)" strokeWidth="0.5" />
              </Svg>
            </View>

          </Animated.View>

          <Animated.View style={[s.nameWrap, { opacity: nameOpacity }]}>
            <Text style={s.psychName}>Маргарита Журавлёва</Text>
            <Animated.View style={[s.bioWrap, { opacity: bioOpacity }]}>
              <Text style={s.bioText}>Практикующий психолог</Text>
              <Text style={s.bioText}>4,5 года успешной практики</Text>
              <Text style={s.bioText}>Дипломированный специалист</Text>
            </Animated.View>
          </Animated.View>

          <Animated.View style={[s.animiSection, { opacity: animiOpacity }]}>
            <View style={s.animiDivider}>
              <View style={s.animiLine} />
              <View style={s.animiDot} />
              <View style={s.animiLine} />
            </View>
            <Text style={s.animiName}>Animi Nava</Text>
            <Text style={s.animiRu}>Душа · Разум · Гармония</Text>
            <Text style={s.animiEn}>Soul · Mind · Harmony</Text>
          </Animated.View>

        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2447',
    justifyContent: 'center',
    alignItems: 'center',
  },

  studioWrap: { alignItems: 'center' },
  studioName: { fontSize: 52, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  studioSub: { fontSize: 22, fontWeight: '300', color: '#C9A84C', letterSpacing: 8, marginTop: -8 },
  studioDivider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16, width: 160 },
  studioDivLine: { flex: 1, height: 1, backgroundColor: 'rgba(201,168,76,0.3)' },
  studioDivDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#C9A84C' },
  studioTagline: { color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: 2 },

  photoWrap: { alignItems: 'center', paddingHorizontal: 16, width: '100%' },

  outerFrame: {
    width: FRAME + 40,
    height: FRAME_H + 40,
    position: 'relative',
    marginBottom: 16,
  },

  photoContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: FRAME,
    height: FRAME_H,
    borderRadius: 8,
    overflow: 'hidden',
  },

  photo: { width: FRAME, height: FRAME_H },

  photoGrad: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(15,36,71,0.5)',
  },

  svgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },

  nameWrap: { alignItems: 'center', marginBottom: 8 },
  psychName: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8, textAlign: 'center' },
  bioWrap: { alignItems: 'center', gap: 2 },
  bioText: { fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.3 },

  animiSection: { alignItems: 'center', marginTop: 12 },
  animiDivider: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 140, marginBottom: 10 },
  animiLine: { flex: 1, height: 1, backgroundColor: 'rgba(201,168,76,0.3)' },
  animiDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#C9A84C' },
  animiName: { fontSize: 28, fontWeight: '900', color: '#C9A84C', letterSpacing: 4, marginBottom: 4 },
  animiRu: { fontSize: 13, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, marginBottom: 2 },
  animiEn: { fontSize: 11, color: 'rgba(201,168,76,0.55)', letterSpacing: 2 },
});