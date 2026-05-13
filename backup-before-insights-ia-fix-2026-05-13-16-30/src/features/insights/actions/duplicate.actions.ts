"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { DuplicateStatus } from "../types/insights.types";
import { revalidatePath } from "next/cache";

export async function updateDuplicateStatusAction(userId: string, groupKey: string, status: DuplicateStatus, payload: any = {}) {
  try {
    const { data, error } = await supabaseAdmin
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

    if (error) {
      console.error("[updateDuplicateStatusAction] DB Error:", error);
      return { error: `DB ${error.code}: ${error.message}${error.details ? ' - ' + error.details : ''}` };
    }

    revalidatePath('/insights-ia');
    return { success: true, data };
  } catch (err: any) {
    console.error("[updateDuplicateStatusAction] Critical Error:", err);
    return { error: `Erro Crítico: ${err.message || "Erro interno"}` };
  }
}

export async function getDuplicateReviewsAction(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('duplicate_reviews')
      .select('*')
      .eq('app_user_id', userId);

    if (error) {
      console.error("[getDuplicateReviewsAction] Error:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("[getDuplicateReviewsAction] Critical Error:", err);
    return [];
  }
}
