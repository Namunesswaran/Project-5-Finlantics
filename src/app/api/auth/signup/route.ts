import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { name, orgName, email, password } = await req.json();

  if (!email || !password || !orgName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "That email is already registered" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const org = await prisma.organization.create({ data: { name: orgName } });
  const user = await prisma.user.create({
    data: { name, email, password: hashed, organizationId: org.id },
  });

  return NextResponse.json({ id: user.id });
}
