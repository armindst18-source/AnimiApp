import { supabase } from './supabase';

export const saveSlots = async (date, startTime, endTime) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('time_slots').insert({
    date, start_time: startTime, end_time: endTime,
    psychologist_id: user.id, is_booked: false,
  });
  if (error) throw error;
  return data;
};

export const getSlotsByDate = async (date) => {
  const { data, error } = await supabase
    .from('time_slots').select('*')
    .eq('date', date).eq('is_booked', false).order('start_time');
  if (error) throw error;
  return data;
};

export const deleteSlot = async (slotId) => {
  const { error } = await supabase.from('time_slots').delete().eq('id', slotId);
  if (error) throw error;
};