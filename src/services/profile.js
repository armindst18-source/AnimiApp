import { supabase } from './supabase';

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getPsychologistProfile = async () => {
  const { data, error } = await supabase
    .from('psychologist_profile')
    .select('*, users(*)')
    .single();
  if (error) throw error;
  return data;
};

export const updatePsychologistProfile = async (profileId, updates) => {
  const { data, error } = await supabase
    .from('psychologist_profile')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();
  if (error) throw error;
  return data;
};