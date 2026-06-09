import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';
import Svg, { Line, Rect, Polygon, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const FRAME = width * 0.72;

export default function SplashScreen({ navigation }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const fadeText1 = useRef(new Animated.Value(0)).current;
  const fadeText2 = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue:1, duration:900, useNativeDriver:true }),
      Animated.timing(scaleAnim, { toValue:1, duration:900, useNativeDriver:true }),
      Animated.timing(fadeText1, { toValue:1, duration:800, delay:600, useNativeDriver:true }),
    ]).start();

    setTimeout(() => {
      Animated.timing(fadeText2, { toValue:1, duration:600, useNativeDriver:true }).start();
    }, 2500);

    setTimeout(() => {
      Animated.timing(fadeAnim, { toValue:0, duration:500, useNativeDriver:true }).start(() => {
        navigation.replace('Welcome');
      });
    }, 5000);
  }, []);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F2447" />
      <Animated.View style={[s.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>

        <View style={s.frameWrap}>
          <View style={s.svgOuter}>
            <Svg width={FRAME + 40} height={FRAME + 40}>
              <Line x1="0" y1="20" x2="60" y2="20" stroke="#C9A84C" strokeWidth="1.5" />
              <Line x1="20" y1="0" x2="20" y2="60" stroke="#C9A84C" strokeWidth="1.5" />
              <Line x1={FRAME-20} y1="0" x2={FRAME-20} y2="60" stroke="#C9A84C" strokeWidth="1.5" />
              <Line x1={FRAME-60} y1="20" x2={FRAME+40} y2="20" stroke="#C9A84C" strokeWidth="1.5" />
              <Line x1="0" y1={FRAME-20} x2="60" y2={FRAME-20} stroke="#C9A84C" strokeWidth="1.5" />
              <Line x1="20" y1={FRAME-60} x2="20" y2={FRAME+40} stroke="#C9A84C" strokeWidth="1.5" />
              <Line x1={FRAME-20} y1={FRAME-60} x2={FRAME-20} y2={FRAME+40} stroke="#C9A84C" strokeWidth="1.5" />
              <Line x1={FRAME-60} y1={FRAME-20} x2={FRAME+40} y2={FRAME-20} stroke="#C9A84C" strokeWidth="1.5" />
              <Polygon points="20,8 28,20 20,32 12,20" fill="none" stroke="#C9A84C" strokeWidth="1" />
              <Polygon points={`${FRAME},8 ${FRAME+8},20 ${FRAME},32 ${FRAME-8},20`} fill="none" stroke="#C9A84C" strokeWidth="1" />
              <Polygon points={`20,${FRAME-12} 28,${FRAME} 20,${FRAME+12} 12,${FRAME}`} fill="none" stroke="#C9A84C" strokeWidth="1" />
              <Polygon points={`${FRAME},${FRAME-12} ${FRAME+8},${FRAME} ${FRAME},${FRAME+12} ${FRAME-8},${FRAME}`} fill="none" stroke="#C9A84C" strokeWidth="1" />
              <Line x1={FRAME/2-20} y1="20" x2={FRAME/2+20} y2="20" stroke="#2E5DA6" strokeWidth="1" />
              <Line x1={FRAME/2-20} y1={FRAME} x2={FRAME/2+20} y2={FRAME} stroke="#2E5DA6" strokeWidth="1" />
              <Line x1="20" y1={FRAME/2-20} x2="20" y2={FRAME/2+20} stroke="#2E5DA6" strokeWidth="1" />
              <Line x1={FRAME} y1={FRAME/2-20} x2={FRAME} y2={FRAME/2+20} stroke="#2E5DA6" strokeWidth="1" />
              <Circle cx="20" cy="20" r="3" fill="#C9A84C" />
              <Circle cx={FRAME} cy="20" r="3" fill="#C9A84C" />
              <Circle cx="20" cy={FRAME} r="3" fill="#C9A84C" />
              <Circle cx={FRAME} cy={FRAME} r="3" fill="#C9A84C" />
              <Rect x="20" y="20" width={FRAME-20} height={FRAME-20} fill="none" stroke="rgba(201,168,76,0.35)" strokeWidth="1" />
              <Rect x="26" y="26" width={FRAME-32} height={FRAME-32} fill="none" stroke="rgba(46,93,166,0.3)" strokeWidth="0.5" />
            </Svg>
          </View>
          <Image source={require('../../assets/psychologist.jpg')} style={s.photo} resizeMode="cover" />
          <View style={s.photoGrad} />
        </View>

        <Text style={s.appName}>Animi</Text>
        <Animated.Text style={[s.meaningRu, { opacity: fadeText1 }]}>Душа · Разум · Гармония</Animated.Text>
        <Animated.Text style={[s.meaningEn, { opacity: fadeText2 }]}>Soul · Mind · Harmony</Animated.Text>
        <View style={s.divider}>
          <View style={s.divLine} />
          <View style={s.divDot} />
          <View style={s.divLine} />
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0F2447',justifyContent:'center',alignItems:'center'},
  content:{alignItems:'center',paddingHorizontal:20},
  frameWrap:{width:FRAME,height:FRAME,borderRadius:8,overflow:'hidden',marginBottom:24,position:'relative'},
  svgOuter:{position:'absolute',top:-20,left:-20,zIndex:10,pointerEvents:'none'},
  photo:{width:FRAME,height:FRAME},
  photoGrad:{position:'absolute',bottom:0,left:0,right:0,height:80,backgroundColor:'rgba(15,36,71,0.4)'},
  appName:{fontSize:36,fontWeight:'900',color:'#C9A84C',letterSpacing:4,marginBottom:8},
  meaningRu:{fontSize:16,color:'rgba(255,255,255,0.85)',letterSpacing:1.5,fontWeight:'500',marginBottom:4},
  meaningEn:{fontSize:13,color:'rgba(201,168,76,0.65)',letterSpacing:2,fontWeight:'400',marginBottom:20},
  divider:{flexDirection:'row',alignItems:'center',gap:8,width:120},
  divLine:{flex:1,height:1,backgroundColor:'rgba(201,168,76,0.3)'},
  divDot:{width:5,height:5,borderRadius:3,backgroundColor:'#C9A84C'},
});