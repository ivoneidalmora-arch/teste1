import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/core/security/encryption";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("alfa_session")?.value;
  const pathname = request.nextUrl.pathname;

  const publicRoutes = ["/login", "/register", "/forgot-password"];
  const isPublic = publicRoutes.includes(pathname);

  // Validação real de segurança do JWT no Edge
  let validSession = null;
  if (sessionCookie) {
    validSession = await decrypt(sessionCookie);
  }

  // Se não tem sessão válida e tenta acessar rota privada
  if (!validSession && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se tem sessão válida e tenta acessar rota pública (login/register)
  if (validSession && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)"],
};
