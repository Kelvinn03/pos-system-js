export { auth as middleware } from "@/auth";

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth API routes)
         * - api/register (registration API)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login, register, forgot-password (public auth pages)
         */
        "/((?!api/auth|api/register|_next/static|_next/image|favicon.ico|login|register|forgot-password).*)",
    ],
};

