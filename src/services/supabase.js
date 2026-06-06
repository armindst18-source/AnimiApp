import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qcprgufmqivxqpxiarje.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjcHJndWZtcWl2eHFweGlhcmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MjQ4MTksImV4cCI6MjA5NTQwMDgxOX0.xx4qwYUeNobARkt-o215wvEBGn6UEKdEHjuQ23jO85c';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
