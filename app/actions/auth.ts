"use server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

export async function registerUser(data: z.infer<typeof RegisterSchema>) {
  const parsed = RegisterSchema.parse(data);
  const existing = await db.user.findUnique({ where: { email: parsed.email } });
  if (existing) throw new Error("Email already registered");
  const hashed = await bcrypt.hash(parsed.password, 12);
  const user = await db.user.create({
    data: { name: parsed.name, email: parsed.email, password: hashed, phone: parsed.phone },
  });
  return { id: user.id, name: user.name, email: user.email };
}
