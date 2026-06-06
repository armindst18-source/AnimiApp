import { supabase } from './supabase';

export const sendMessage = async (bookingId, senderId, content) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({ booking_id: bookingId, sender_id: senderId, content: content })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getMessages = async (bookingId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const markMessagesRead = async (bookingId, userId) => {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('booking_id', bookingId)
    .neq('sender_id', userId);
  if (error) throw error;
};

export const subscribeToMessages = (bookingId, callback) => {
  return supabase
    .channel('messages:' + bookingId)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: 'booking_id=eq.' + bookingId,
    }, (payload) => callback(payload.new))
    .subscribe();
};