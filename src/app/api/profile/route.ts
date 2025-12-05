import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await request.json();
    const { name, email, currentPassword, newPassword } = body as {
      name?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const userId = Number(session.user.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

    const updates: Record<string, any> = {};

    if (name && name !== user.name) updates.name = name;

    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== user.id) {
        return new Response(JSON.stringify({ error: "Email already in use" }), { status: 400 });
      }
      updates.email = email;
    }

    if (newPassword) {
      if (!currentPassword) {
        return new Response(JSON.stringify({ error: "Current password required to change password" }), { status: 400 });
      }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        return new Response(JSON.stringify({ error: "Current password is incorrect" }), { status: 400 });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      updates.passwordHash = hashed;
    }

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ message: "No changes" }), { status: 200 });
    }

    await prisma.user.update({ where: { id: userId }, data: updates });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

    const userId = Number(session.user.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

    return new Response(JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}
