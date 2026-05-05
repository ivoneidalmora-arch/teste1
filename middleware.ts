import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("alfa_session")?.value;
  const pathname = request.nextUrl.pathname;

  const publicRoutes = ["/login", "/register", "/forgot-password"];
  const isPublic = publicRoutes.includes(pathname);

  // Se não tem sessão e tenta acessar rota privada
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se tem sessão e tenta acessar rota pública (login/register)
  if (session && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)"],
};
