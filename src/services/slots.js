import { supabase } from './supabase';

export const generateSlots = (date, startTime, endTime) => {
  const slots = [];
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let current = sh * 60 + sm;
  const end = eh * 60 + em;
  while (current + 90 <= end) {
    const h1 = Math.floor(current / 60).toString().padStart(2, '0');
    const m1 = (current % 60).toString().padStart(2, '0');
    const next = current + 90;
    const h2 = Math.floor(next / 60).toString().padStart(2, '0');
    const m2 = (next % 60).toString().padStart(2, '0');
    slots.push({
      date: date,
      start_time: h1 + ':' + m1,
      end_time: h2 + ':' + m2,
      is_booked: false,
    });
    current = next;
  }
  return slots;
};

export const saveSlots = async (date, startTime, endTime) => {
  const slots = generateSlots(date, startTime, endTime);
  const { data, error } = await supabase
    .from('time_slots')
    .insert(slots)
    .select();
  if (error) throw error;
  return data;
};

export const markSlotBooked = async (slotId) => {
  const { error } = await supabase
    .from('time_slots')
    .update({ is_booked: true })
    .eq('id', slotId);
  if (error) throw error;
};

export const deleteSlot = async (slotId) => {
  const { error } = await supabase
    .from('time_slots')
    .delete()
    .eq('id', slotId);
  if (error) throw error;
};