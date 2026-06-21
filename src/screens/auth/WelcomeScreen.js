import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Image } from 'react-native';
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
    psychName: 'Маргарита Журавлёва',
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
    breathDesc: 'Перед сессией — 30 секунд дыхательной практики для спокойствия',
    breathInhale: 'Вдох',
    breathHold: 'Задержка',
    breathExhale: 'Выдох',
    breathStarting: 'Сессия начнётся через...',
    typeMessage: 'Написать сообщение...',
    send: 'Отправить',
    noMessages: 'Нет сообщений',
    history: 'История сессий',
    noHistory: 'Нет прошлых сессий',
    aboutPsych: 'О психологе',
    rating: 'Как прошла сессия?',
    ratingDesc: 'Ваш отзыв поможет улучшить качество работы',
    ratingSubmit: 'Отправить отзыв',
    ratingSkip: 'Пропустить',
    ratingThanks: 'Спасибо за отзыв!',
    sessionCountdown: 'До сессии',
    hours: 'ч',
    minutes: 'мин',
    goodMorning: 'Доброе утро',
    goodDay: 'Добрый день',
    goodEvening: 'Добрый вечер',
    bookingConfirmed: 'Запись подтверждена',
    bookingDate: 'Дата',
    bookingTime: 'Время',
    bookingDuration: 'Длительность',
    bookingDurationVal: '1 час 30 минут',
    backHome: 'На главную',
    noteTitle: 'Заметка о сессии',
    notePlaceholder: 'Личные заметки о клиенте...',
    noteSave: 'Сохранить заметку',
    noteSaved: 'Заметка сохранена',
    deleteSlot: 'Удалить слот?',
    deleteConfirm: 'Этот слот будет удалён.',
    cancel: 'Отмена',
    delete: 'Удалить',
    noSlotDay: 'Нет слотов на этот день',
    chooseDate: 'ВЫБЕРИТЕ ДАТУ',
    chooseTime: 'ВЫБЕРИТЕ ВРЕМЯ (сессия 1.5 ч)',
    clients: 'Клиенты',
    noClients: 'Нет клиентов',
    sessionEnd: 'Завершить сессию?',
    sessionEndMsg: 'Вы уверены, что хотите покинуть сессию?',
    sessionEndConfirm: 'Завершить',
    connecting: 'Подключение...',
    connectionErr: 'Не удалось подключиться. Проверьте интернет.',
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
    psychName: 'Margarita Zhuravleva',
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
    breathDesc: '30 seconds of breathing before your session begins',
    breathInhale: 'Inhale',
    breathHold: 'Hold',
    breathExhale: 'Exhale',
    breathStarting: 'Session starts in...',
    typeMessage: 'Type a message...',
    send: 'Send',
    noMessages: 'No messages yet',
    history: 'Session history',
    noHistory: 'No past sessions',
    aboutPsych: 'About psychologist',
    rating: 'How was your session?',
    ratingDesc: 'Your feedback helps improve the quality',
    ratingSubmit: 'Submit feedback',
    ratingSkip: 'Skip',
    ratingThanks: 'Thank you for your feedback!',
    sessionCountdown: 'Session in',
    hours: 'h',
    minutes: 'min',
    goodMorning: 'Good morning',
    goodDay: 'Good afternoon',
    goodEvening: 'Good evening',
    bookingConfirmed: 'Booking confirmed',
    bookingDate: 'Date',
    bookingTime: 'Time',
    bookingDuration: 'Duration',
    bookingDurationVal: '1 hour 30 minutes',
    backHome: 'Back to home',
    noteTitle: 'Session note',
    notePlaceholder: 'Personal notes about the client...',
    noteSave: 'Save note',
    noteSaved: 'Note saved',
    deleteSlot: 'Delete slot?',
    deleteConfirm: 'This slot will be deleted.',
    cancel: 'Cancel',
    delete: 'Delete',
    noSlotDay: 'No slots for this day',
    chooseDate: 'CHOOSE DATE',
    chooseTime: 'CHOOSE TIME (1.5 h session)',
    clients: 'Clients',
    noClients: 'No clients yet',
    sessionEnd: 'End session?',
    sessionEndMsg: 'Are you sure you want to leave?',
    sessionEndConfirm: 'End session',
    connecting: 'Connecting...',
    connectionErr: 'Could not connect. Check your internet.',
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
          <Text style={[s.langText, lang === 'ru' && s.langTextActive]}>RU</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.langBtn, lang === 'en' && s.langActive]} onPress={() => setLang('en')}>
          <Text style={[s.langText, lang === 'en' && s.langTextActive]}>EN</Text>
        </TouchableOpacity>
      </View>

      <View style={s.center}>
        <View style={s.frameOuter}>
          <View style={s.frameRing}>
            <View style={s.photoFrame}>
              <Image
                source={require('../../../assets/splash.png')}
                style={s.psychPhoto}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        <Text style={s.psychName}>Маргарита Журавлёва</Text>

        <View style={s.divider}>
          <View style={s.divLine} />
          <View style={s.divDot} />
          <View style={s.divLine} />
        </View>

        <Text style={s.tagline}>{t.tagline}</Text>
        <Text style={s.desc}>{t.desc}</Text>
      </View>

      <View style={s.features}>
        {[
          { icon: '⏱', text: t.session },
          { icon: '🔒', text: t.private },
          { icon: '🌐', text: t.online },
        ].map((f, i) => (
          <View key={i}>
            <View style={s.featureItem}>
              <View style={s.featureIconWrap}>
                <Text style={s.featureIcon}>{f.icon}</Text>
              </View>
              <Text style={s.featureText}>{f.text}</Text>
            </View>
            {i < 2 && <View style={s.featureSep} />}
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.btn} onPress={handleStart} activeOpacity={0.85}>
        <Text style={s.btnText}>{t.enter}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F2447', paddingHorizontal: 28, paddingTop: 56, paddingBottom: 36 },

  langRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 16 },
  langBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)' },
  langActive: { backgroundColor: '#C9A84C', borderColor: '#C9A84C' },
  langText: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  langTextActive: { color: '#0F2447' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  frameOuter: {
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 14,
  },
  frameRing: {
    width: 156,
    height: 156,
    borderRadius: 78,
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  photoFrame: {
    width: 138,
    height: 138,
    borderRadius: 69,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#C9A84C',
    backgroundColor: '#fff',
  },
  psychPhoto: { width: 138, height: 138, backgroundColor: 'transparent' },

  psychName: { fontSize: 19, fontWeight: '700', color: '#fff', marginBottom: 14, letterSpacing: 0.3 },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 130, marginBottom: 18 },
  divLine: { flex: 1, height: 1, backgroundColor: 'rgba(201,168,76,0.3)' },
  divDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#C9A84C' },

  tagline: { fontSize: 21, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 12, lineHeight: 28 },
  desc: { fontSize: 13.5, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 21, paddingHorizontal: 8 },

  features: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.15)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 26,
  },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, paddingHorizontal: 8 },
  featureIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(201,168,76,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  featureIcon: { fontSize: 16 },
  featureText: { color: 'rgba(255,255,255,0.75)', fontSize: 13.5, flex: 1 },
  featureSep: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 8 },

  btn: {
    backgroundColor: '#C9A84C',
    borderRadius: 17,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnText: { color: '#0F2447', fontSize: 15.5, fontWeight: '800', letterSpacing: 0.3 },
});
