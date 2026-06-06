import { supabase } from './supabase';

export const getAvailableSlots = async (date) => {
  const { data, error } = await supabase
    .from('time_slots')
    .select('*')
    .eq('date', date)
    .eq('is_booked', false);
  if (error) throw error;
  return data;
};

export const createBooking = async (clientId, slotId, paymentId) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      client_id: clientId,
      slot_id: slotId,
      status: 'confirmed',
      payment_status: 'paid',
      is_rescheduled: false,
      payment_id: paymentId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const rescheduleBooking = async (bookingId, newSlotId) => {
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('is_rescheduled')
    .eq('id', bookingId)
    .single();
  if (fetchError) throw fetchError;
  if (booking.is_rescheduled) throw new Error('Already rescheduled once');
  const { data, error } = await supabase
    .from('bookings')
    .update({ slot_id: newSlotId, is_rescheduled: true })
    .eq('id', bookingId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getClientBookings = async (clientId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, time_slots(*)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getAllBookings = async () => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, time_slots(*), users(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};