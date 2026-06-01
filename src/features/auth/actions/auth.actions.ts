"use server";

import { cookies, headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";
import { auditLogService } from "@/features/audit/services/audit-log.service";
import { createSession, destroySession, getSession as getCoreSession } from "@/core/auth/session";

export async function registerUser(formData: FormData) {
  try {
    const username = (formData.get("username") as string)?.trim();
    const password = formData.get("password") as string;

    if (!username || username.length < 3) {
      return { error: "Usuário deve ter pelo menos 3 caracteres." };
    }
    if (!password || password.length < 6) {
      return { error: "Senha deve ter pelo menos 6 caracteres." };
    }

    // Verificar se usuário já existe usando Admin (ignora RLS)
    const { data: existing } = await supabaseAdmin
      .from("app_users")
      .select("id")
      .eq("username", username.toLowerCase())
      .maybeSingle();

    if (existing) {
      return { error: "Usuário já existe." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabaseAdmin
      .from("app_users")
      .insert([
        { 
          username: username.toLowerCase(), 
          password_hash: hashedPassword 
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("[Register] DB Error:", error);
      return { error: "Erro ao criar conta no banco de dados." };
    }

    // Sincronizar com auth.users para satisfazer restrições de chave estrangeira
    try {
      await supabaseAdmin.auth.admin.createUser({
        id: data.id,
        email: `${username.toLowerCase()}@alfa.com`,
        password: password,
        email_confirm: true
      });
    } catch (authError) {
      console.error("[Register] Warning - falha ao sincronizar com auth.users:", authError);
      // Não bloqueia o cadastro principal se falhar, mas loga o erro
    }

    // Criar sessão após cadastro
    await createSession(data.id, data.username);

    await auditLogService.log({
      userId: data.id,
      action: 'CREATE',
      entityType: 'RECEITA', // Usando RECEITA como placeholder ou criar entity USER
      entityId: data.id,
      newValues: { username: data.username }
    });

    return { success: true, user: { id: data.id, username: data.username } };
  } catch (err: any) {
    console.error("[Register] Critical Error:", err);
    return { error: "Erro crítico ao registrar usuário." };
  }
}

export async function loginUser(formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const userAgent = headersList.get("user-agent") || "unknown";

  try {
    const username = (formData.get("username") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;

    if (!username || !password) {
      return { error: "Usuário e senha são obrigatórios." };
    }

    // 1. Rate Limiting: Verificar tentativas nos últimos 15 minutos
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count: recentAttempts } = await supabaseAdmin
      .from("auth_attempts")
      .select("*", { count: "exact", head: true })
      .eq("username", username)
      .eq("success", false)
      .gt("attempted_at", fifteenMinsAgo);

    if (recentAttempts && recentAttempts >= 5) {
      return { error: "Muitas tentativas falhas. Tente novamente em 15 minutos." };
    }

    const { data: user, error: dbError } = await supabaseAdmin
      .from("app_users")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (dbError || !user) {
      // Registrar tentativa falha
      await supabaseAdmin.from("auth_attempts").insert([{ username, ip_address: ip, success: false }]);
      return { error: "Usuário ou senha inválidos." };
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordCorrect) {
      // Registrar tentativa falha
      await supabaseAdmin.from("auth_attempts").insert([{ username, ip_address: ip, success: false }]);
      // Log de segurança
      await supabaseAdmin.from("auth_logs").insert([{ 
        app_user_id: user.id, 
        action: 'failed_login', 
        ip_address: ip, 
        user_agent: userAgent,
        details: { reason: 'wrong_password' }
      }]);
      return { error: "Usuário ou senha inválidos." };
    }

    // Sucesso: Limpar tentativas anteriores (opcional ou marcar como sucesso)
    await supabaseAdmin.from("auth_attempts").insert([{ username, ip_address: ip, success: true }]);

    await createSession(user.id, user.username);

    // Log de Sucesso
    await auditLogService.log({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'RECEITA',
      entityId: user.id,
      status: 'SUCCESS'
    });

    return { success: true, user: { id: user.id, username: user.username } };
  } catch (error: any) {
    console.error("[Login] Critical error:", error);
    return { error: "Erro interno no servidor." };
  }
}

export async function logoutUser() {
  await destroySession();
  return { success: true };
}

export async function getSession() {
  return await getCoreSession();
}
