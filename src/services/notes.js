import { supabase } from './supabase';

export const saveNote = async (clientId, content) => {
  const { data, error } = await supabase
    .from('private_notes')
    .upsert({ client_id: clientId, content: content })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getNote = async (clientId) => {
  const { data, error } = await supabase
    .from('private_notes')
    .select('*')
    .eq('client_id', clientId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const saveSessionSummary = async (bookingId, summary, homework) => {
  const { data, error } = await supabase
    .from('session_summaries')
    .insert({ booking_id: bookingId, summary: summary, homework: homework })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getSessionSummary = async (bookingId) => {
  const { data, error } = await supabase
    .from('session_summaries')
    .select('*')
    .eq('booking_id', bookingId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};