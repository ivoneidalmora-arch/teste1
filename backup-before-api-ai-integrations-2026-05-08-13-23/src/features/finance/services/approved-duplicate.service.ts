import { supabase } from '@/services/supabase';

export interface ApprovedDuplicate {
  id: string;
  app_user_id: string;
  vehicle_plate: string;
  service_name: string;
  transaction_ids: (string | number)[];
  approved_by: string;
  approved_at: string;
}

export const approvedDuplicateService = {
  async getAll(app_user_id: string): Promise<ApprovedDuplicate[]> {
    const { data, error } = await supabase
      .from('approved_duplicates')
      .select('*')
      .eq('app_user_id', app_user_id);

    if (error) throw error;
    return data || [];
  },

  async approve(payload: Omit<ApprovedDuplicate, 'id' | 'approved_at'>): Promise<ApprovedDuplicate> {
    const { data, error } = await supabase
      .from('approved_duplicates')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string, app_user_id: string): Promise<boolean> {
    const { error } = await supabase
      .from('approved_duplicates')
      .delete()
      .eq('id', id)
      .eq('app_user_id', app_user_id);

    if (error) throw error;
    return true;
  }
};
