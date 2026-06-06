import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from '../services/supabase';
import { getUserRole } from '../services/auth';

import PhoneScreen from '../screens/auth/PhoneScreen';
import OTPScreen from '../screens/auth/OTPScreen';

import HomeScreen from '../screens/client/HomeScreen';
import BookingScreen from '../screens/client/BookingScreen';
import ChatScreen from '../screens/client/ChatScreen';
import VideoCallScreen from '../screens/client/VideoCallScreen';
import BreathingScreen from '../screens/client/BreathingScreen';

import DashboardScreen from '../screens/psychologist/DashboardScreen';
import CalendarScreen from '../screens/psychologist/CalendarScreen';
import ClientsScreen from '../screens/psychologist/ClientsScreen';
import PsychChatScreen from '../screens/psychologist/PsychChatScreen';
import PsychVideoScreen from '../screens/psychologist/PsychVideoScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        try {
          const r = await getUserRole(session.user.id);
          setRole(r);
        } catch (e) {
          setRole('client');
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          try {
            const r = await getUserRole(session.user.id);
            setRole(r);
          } catch (e) {
            setRole('client');
          }
        } else {
          setUser(null);
          setRole(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Phone" component={PhoneScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
          </>
        ) : role === 'psychologist' ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Calendar" component={CalendarScreen} />
            <Stack.Screen name="Clients" component={ClientsScreen} />
            <Stack.Screen name="PsychChat" component={PsychChatScreen} />
            <Stack.Screen name="PsychVideo" component={PsychVideoScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Video" component={VideoCallScreen} />
            <Stack.Screen name="Breathing" component={BreathingScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}