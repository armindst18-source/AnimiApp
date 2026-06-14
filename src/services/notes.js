import { supabase } from './supabase';

export const saveNote = async (psychologistId, clientId, content) => {
  const { data, error } = await supabase
    .from('psych_notes')
    .upsert({
      psychologist_id: psychologistId,
      client_id: clientId,
      note: content,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getNote = async (psychologistId, clientId) => {
  const { data, error } = await supabase
    .from('psych_notes')
    .select('*')
    .eq('psychologist_id', psychologistId)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
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