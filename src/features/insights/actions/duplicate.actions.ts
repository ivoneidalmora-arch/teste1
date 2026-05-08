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
      console.error("[updateDuplicateStatusAction] Error:", error);
      return { error: error.message };
    }

    revalidatePath('/insights-ia');
    return { success: true, data };
  } catch (err: any) {
    console.error("[updateDuplicateStatusAction] Critical Error:", err);
    return { error: err.message || "Erro interno ao atualizar status" };
  }
}
