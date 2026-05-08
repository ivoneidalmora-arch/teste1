"use server";

import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Variável de ambiente JWT_SECRET não configurada.");
}
const key = new TextEncoder().encode(JWT_SECRET);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

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

    // Criar sessão após cadastro
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ user: { id: data.id, username: data.username }, expires });

    const cookieStore = await cookies();
    cookieStore.set("alfa_session", session, { 
      expires, 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "lax",
      path: "/"
    });

    return { success: true, user: { id: data.id, username: data.username } };
  } catch (err: any) {
    console.error("[Register] Critical Error:", err);
    return { error: "Erro crítico ao registrar usuário." };
  }
}

export async function loginUser(formData: FormData) {
  try {
    const username = (formData.get("username") as string)?.trim();
    const password = formData.get("password") as string;

    if (!username || !password) {
      return { error: "Usuário e senha são obrigatórios." };
    }

    const { data: user, error: dbError } = await supabaseAdmin
      .from("app_users")
      .select("*")
      .eq("username", username.toLowerCase())
      .maybeSingle();

    if (dbError || !user) {
      if (dbError) console.error("[Login] DB error:", dbError);
      return { error: "Usuário ou senha inválidos." };
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordCorrect) {
      return { error: "Usuário ou senha inválidos." };
    }

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ user: { id: user.id, username: user.username }, expires });

    const cookieStore = await cookies();
    cookieStore.set("alfa_session", session, { 
      expires, 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });

    return { success: true, user: { id: user.id, username: user.username } };
  } catch (error: any) {
    console.error("[Login] Critical error:", error);
    return { error: "Erro interno no servidor." };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.set("alfa_session", "", { 
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  return { success: true };
}

export async function getSession() {
  const session = (await cookies()).get("alfa_session")?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch (err) {
    return null;
  }
}
