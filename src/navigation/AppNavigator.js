import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabase';
import { getUserRole } from '../services/auth';

import SplashScreen          from '../screens/SplashScreen';
import WelcomeScreen         from '../screens/auth/WelcomeScreen';
import PhoneScreen           from '../screens/auth/PhoneScreen';
import OTPScreen             from '../screens/auth/OTPScreen';

import HomeScreen            from '../screens/client/HomeScreen';
import BookingScreen         from '../screens/client/BookingScreen';
import BookingSuccessScreen  from '../screens/client/BookingSuccessScreen';
import ChatScreen            from '../screens/client/ChatScreen';
import VideoCallScreen       from '../screens/client/VideoCallScreen';
import BreathingScreen       from '../screens/client/BreathingScreen';
import ProfileScreen         from '../screens/client/ProfileScreen';
import RatingScreen          from '../screens/client/RatingScreen';
import AboutPsychScreen      from '../screens/client/AboutPsychScreen';

import DashboardScreen       from '../screens/psychologist/DashboardScreen';
import CalendarScreen        from '../screens/psychologist/CalendarScreen';
import ClientsScreen         from '../screens/psychologist/ClientsScreen';
import PsychChatScreen       from '../screens/psychologist/PsychChatScreen';
import PsychVideoScreen      from '../screens/psychologist/PsychVideoScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        try { setRole(await getUserRole(session.user.id)); }
        catch { setRole('client'); }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          try { setRole(await getUserRole(session.user.id)); }
          catch { setRole('client'); }
        } else {
          setUser(null);
          setRole(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F2447' }}>
      <ActivityIndicator size="large" color="#C9A84C" />
    </View>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!user ? (
          <>
            <Stack.Screen name="Splash"   component={SplashScreen} />
            <Stack.Screen name="Welcome"  component={WelcomeScreen} />
            <Stack.Screen name="Phone"    component={PhoneScreen} />
            <Stack.Screen name="OTP"      component={OTPScreen} />
          </>
        ) : role === 'psychologist' ? (
          <>
            <Stack.Screen name="Dashboard"  component={DashboardScreen} />
            <Stack.Screen name="Calendar"   component={CalendarScreen} />
            <Stack.Screen name="Clients"    component={ClientsScreen} />
            <Stack.Screen name="PsychChat"  component={PsychChatScreen} />
            <Stack.Screen name="PsychVideo" component={PsychVideoScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home"           component={HomeScreen} />
            <Stack.Screen name="Booking"        component={BookingScreen} />
            <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
            <Stack.Screen name="Chat"           component={ChatScreen} />
            <Stack.Screen name="Video"          component={VideoCallScreen} />
            <Stack.Screen name="Breathing"      component={BreathingScreen} />
            <Stack.Screen name="Profile"        component={ProfileScreen} />
            <Stack.Screen name="Rating"         component={RatingScreen} />
            <Stack.Screen name="AboutPsych"     component={AboutPsychScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}