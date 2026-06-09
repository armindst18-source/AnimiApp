import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TEXTS = {
  ru: {
    tagline: 'Психологическая помощь онлайн',
    desc: 'Сессии один на один с лицензированным психологом',
    enter: 'Войти / Зарегистрироваться',
    session: '1 сессия = 1.5 часа',
    private: 'Полная конфиденциальность',
    online: 'Онлайн в любом месте',
    enterEmail: 'Введите ваш email',
    sendCode: 'Получить код',
    codeSent: 'Код отправлен на',
    enterCode: 'Введите код из письма',
    confirm: 'Подтвердить',
    wrongCode: 'Неверный код. Попробуйте снова.',
    wrongEmail: 'Введите корректный email',
    sendErr: 'Ошибка отправки. Попробуйте снова.',
    saveErr: 'Ошибка сохранения.',
    yourName: 'Как вас зовут?',
    namePlaceholder: 'Ваше имя или псевдоним',
    nameRequired: 'Введите имя',
    continueTxt: 'Продолжить',
    welcome: 'Добро пожаловать',
    noSession: 'У вас нет записей',
    bookNow: 'Записаться',
    nextSession: 'СЛЕДУЮЩАЯ СЕССИЯ',
    connect: 'Подключиться',
    paid: 'ОПЛАЧЕНО',
    pending: 'ОЖИДАЕТ ОПЛАТЫ',
    quickActions: 'БЫСТРЫЕ ДЕЙСТВИЯ',
    bookTime: 'Выбрать время',
    messages: 'Сообщения',
    myPsych: 'Ваш психолог',
    method: 'Метод одной сессии · онлайн',
    myProfile: 'Мой профиль',
    logout: 'Выйти из аккаунта',
    phone: 'Телефон',
    name: 'Имя',
    noSlots: 'Нет свободных слотов на этот день',
    availableTime: 'Доступное время',
    book: 'Подтвердить запись',
    bookSuccess: 'Запись создана!',
    bookSuccessMsg: 'Ваша запись подтверждена.',
    error: 'Ошибка',
    tryAgain: 'Попробуйте снова.',
    today: 'СЕССИИ СЕГОДНЯ',
    noToday: 'Нет сессий сегодня',
    setSchedule: 'Мой график',
    save: 'Сохранить',
    saved: 'Сохранено!',
    duration: '· 1.5 ч',
    breathTitle: 'Дыхательная практика',
    breathSub: 'Успокойтесь перед сессией',
    breathInhale: 'Вдох',
    breathHold: 'Задержка',
    breathExhale: 'Выдох',
    breathStart: 'Начать',
    breathStop: 'Стоп',
    typeMessage: 'Написать сообщение...',
    send: 'Отправить',
    noMessages: 'Нет сообщений',
    history: 'История сессий',
    noHistory: 'Нет прошлых сессий',
  },
  en: {
    tagline: 'Online psychological support',
    desc: 'One-on-one sessions with a licensed psychologist',
    enter: 'Sign in / Register',
    session: '1 session = 1.5 hours',
    private: 'Full confidentiality',
    online: 'Online from anywhere',
    enterEmail: 'Enter your email',
    sendCode: 'Get code',
    codeSent: 'Code sent to',
    enterCode: 'Enter code from email',
    confirm: 'Confirm',
    wrongCode: 'Wrong code. Try again.',
    wrongEmail: 'Enter a valid email',
    sendErr: 'Send error. Try again.',
    saveErr: 'Save error.',
    yourName: 'What is your name?',
    namePlaceholder: 'Your name or nickname',
    nameRequired: 'Enter your name',
    continueTxt: 'Continue',
    welcome: 'Welcome',
    noSession: 'No upcoming sessions',
    bookNow: 'Book a session',
    nextSession: 'NEXT SESSION',
    connect: 'Join',
    paid: 'PAID',
    pending: 'AWAITING PAYMENT',
    quickActions: 'QUICK ACTIONS',
    bookTime: 'Choose time',
    messages: 'Messages',
    myPsych: 'Your psychologist',
    method: 'Single session method · online',
    myProfile: 'My profile',
    logout: 'Log out',
    phone: 'Phone',
    name: 'Name',
    noSlots: 'No available slots for this day',
    availableTime: 'Available time',
    book: 'Confirm booking',
    bookSuccess: 'Booking created!',
    bookSuccessMsg: 'Your session is confirmed.',
    error: 'Error',
    tryAgain: 'Please try again.',
    today: "TODAY'S SESSIONS",
    noToday: 'No sessions today',
    setSchedule: 'My schedule',
    save: 'Save',
    saved: 'Saved!',
    duration: '· 1.5 h',
    breathTitle: 'Breathing practice',
    breathSub: 'Calm down before your session',
    breathInhale: 'Inhale',
    breathHold: 'Hold',
    breathExhale: 'Exhale',
    breathStart: 'Start',
    breathStop: 'Stop',
    typeMessage: 'Type a message...',
    send: 'Send',
    noMessages: 'No messages yet',
    history: 'Session history',
    noHistory: 'No past sessions',
  },
};

export default function WelcomeScreen({ navigation }) {
  const [lang, setLang] = useState('ru');
  const t = TEXTS[lang];

  const handleStart = async () => {
    await AsyncStorage.setItem('lang', lang);
    navigation.navigate('Phone', { lang });
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <View style={s.langRow}>
        <TouchableOpacity style={[s.langBtn, lang === 'ru' && s.langActive]} onPress={() => setLang('ru')}>
          <Text style={[s.langText, lang === 'ru' && s.langTextActive]}>🇷🇺 RU</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.langBtn, lang === 'en' && s.langActive]} onPress={() => setLang('en')}>
          <Text style={[s.langText, lang === 'en' && s.langTextActive]}>🇬🇧 EN</Text>
        </TouchableOpacity>
      </View>
      <View style={s.center}>
        <View style={s.logoCircle}>
          <Text style={s.logoText}>Animi</Text>
        </View>
        <Text style={s.tagline}>{t.tagline}</Text>
        <Text style={s.desc}>{t.desc}</Text>
      </View>
      <View style={s.features}>
        {[{icon:'⏱',text:t.session},{icon:'🔒',text:t.private},{icon:'🌐',text:t.online}].map((f,i) => (
          <View key={i} style={s.featureItem}>
            <Text style={s.featureIcon}>{f.icon}</Text>
            <Text style={s.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={s.btn} onPress={handleStart}>
        <Text style={s.btnText}>{t.enter}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#0F2447',paddingHorizontal:28,paddingTop:56,paddingBottom:36},
  langRow:{flexDirection:'row',justifyContent:'flex-end',gap:8,marginBottom:20},
  langBtn:{paddingHorizontal:14,paddingVertical:6,borderRadius:20,backgroundColor:'rgba(255,255,255,0.08)',borderWidth:1,borderColor:'rgba(255,255,255,0.12)'},
  langActive:{backgroundColor:'#C9A84C',borderColor:'#C9A84C'},
  langText:{color:'rgba(255,255,255,0.6)',fontSize:13,fontWeight:'600'},
  langTextActive:{color:'#0F2447'},
  center:{flex:1,justifyContent:'center',alignItems:'center'},
  logoCircle:{width:100,height:100,borderRadius:30,backgroundColor:'rgba(201,168,76,0.15)',borderWidth:2,borderColor:'rgba(201,168,76,0.4)',justifyContent:'center',alignItems:'center',marginBottom:24},
  logoText:{fontSize:22,fontWeight:'900',color:'#C9A84C'},
  tagline:{fontSize:20,fontWeight:'700',color:'#fff',textAlign:'center',marginBottom:10},
  desc:{fontSize:13,color:'rgba(255,255,255,0.5)',textAlign:'center',lineHeight:20},
  features:{gap:10,marginBottom:28},
  featureItem:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:'rgba(255,255,255,0.05)',borderRadius:12,padding:12,borderWidth:1,borderColor:'rgba(255,255,255,0.08)'},
  featureIcon:{fontSize:18},
  featureText:{color:'rgba(255,255,255,0.7)',fontSize:13},
  btn:{backgroundColor:'#C9A84C',borderRadius:16,padding:17,alignItems:'center',elevation:6},
  btnText:{color:'#0F2447',fontSize:15,fontWeight:'800'},
});