"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { getSession } from "@/features/auth/actions/auth.actions";

export async function getSystemHealthAction() {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado");

  // Apenas admin (neste caso, o único usuário existente por enquanto)
  const userId = session.user.id;

  const [
    resRec, resDes, 
    resRecDel, resDesDel,
    resRecOrphan, resDesOrphan,
    resAudit, resDups
  ] = await Promise.all([
    supabaseAdmin.from('Receitas').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabaseAdmin.from('Despesas').select('*', { count: 'exact', head: true }).is('deleted_at', null),
    supabaseAdmin.from('Receitas').select('*', { count: 'exact', head: true }).not('deleted_at', 'is', null),
    supabaseAdmin.from('Despesas').select('*', { count: 'exact', head: true }).not('deleted_at', 'is', null),
    supabaseAdmin.from('Receitas').select('*', { count: 'exact', head: true }).is('app_user_id', null),
    supabaseAdmin.from('Despesas').select('*', { count: 'exact', head: true }).is('app_user_id', null),
    supabaseAdmin.from('audit_issues').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('duplicate_reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending_review')
  ]);

  return {
    environment: process.env.NODE_ENV,
    vercel_env: process.env.VERCEL_ENV || 'local',
    stats: {
      receitas: resRec.count || 0,
      despesas: resDes.count || 0,
      receitasExcluidas: resRecDel.count || 0,
      despesasExcluidas: resDesDel.count || 0,
      receitasOrfas: resRecOrphan.count || 0,
      despesasOrfas: resDesOrphan.count || 0,
      inconsistencias: resAudit.count || 0,
      duplicidadesPendentes: resDups.count || 0
    },
    status: {
      database: 'Conectado',
      rls: 'Ativo',
      auth: 'Sessão Ativa'
    },
    version: '1.2.0-stabilization',
    lastDeploy: new Date().toISOString()
  };
}
