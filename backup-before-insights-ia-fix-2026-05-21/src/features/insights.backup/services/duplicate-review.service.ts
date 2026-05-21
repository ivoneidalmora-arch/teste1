import { supabase } from '@/lib/supabase/client';
import { DuplicateStatus, DuplicateGroup } from '../types/insights.types';

export const duplicateReviewService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('duplicate_reviews')
      .select('*')
      .eq('app_user_id', userId);

    if (error) throw error;
    return data || [];
  },

  async updateStatus(userId: string, groupKey: string, status: DuplicateStatus, payload: any = {}) {
    const { data, error } = await supabase
      .from('duplicate_reviews')
      .upsert({
        app_user_id: userId,
        duplicate_group_key: groupKey,
        status,
        updated_at: new Date().toISOString(),
        ...payload
      }, { onConflict: 'app_user_id,duplicate_group_key' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteReview(userId: string, groupKey: string) {
    const { error } = await supabase
      .from('duplicate_reviews')
      .update({ 
        deleted_at: new Date().toISOString(),
        deleted_by: userId
      })
      .eq('app_user_id', userId)
      .eq('duplicate_group_key', groupKey);

    if (error) throw error;
    return true;
  }
};
