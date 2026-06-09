import { supabase } from './supabase';

export const getMessages = async (bookingId) => {
  const { data, error } = await supabase
    .from('messages').select('*')
    .eq('booking_id', bookingId).order('created_at');
  if (error) throw error;
  return data;
};

export const sendMessage = async (bookingId, senderId, content) => {
  const { data, error } = await supabase.from('messages').insert({
    booking_id: bookingId, sender_id: senderId, content,
  }).select().single();
  if (error) throw error;
  return data;
};

export const subscribeToMessages = (bookingId, callback) => {
  return supabase.channel('messages-' + bookingId)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'messages',
      filter: 'booking_id=eq.' + bookingId,
    }, (payload) => callback(payload.new))
    .subscribe();
};