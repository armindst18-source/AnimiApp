import { supabase } from './supabase';

export const getUserRole = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
  if (error || !data) return 'client';
  return data.role;
};