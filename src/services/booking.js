import { supabase } from './supabase';

export const getClientBookings = async (userId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, time_slots(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getAvailableSlots = async (date) => {
  const { data, error } = await supabase
    .from('time_slots').select('*')
    .eq('date', date).eq('is_booked', false).order('start_time');
  if (error) throw error;
  return data;
};

export const createBooking = async (userId, slotId) => {
  const { data, error } = await supabase.from('bookings').insert({
    user_id: userId, slot_id: slotId, status: 'pending_payment',
  }).select().single();
  if (error) throw error;
  await supabase.from('time_slots').update({ is_booked: true }).eq('id', slotId);
  return data;
};

export const getPsychBookings = async () => {
  const { data, error } = await supabase
    .from('bookings').select('*, time_slots(*), users(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};