import type { Metadata } from "next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { auth } from "@/auth";
import AppNavbar from "@/components/AppNavbar";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "POS System",
  description: "Simple POS system built with Next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <AppNavbar session={session} />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
