import { password } from "bun";
import z from "zod";
export const signupSchema = z.object({
    name:z.string(),
    email:z.string().email(),
    password:z.string().min(6),
    role:z.enum(['client','freelancer']).default('client'),
    bio:z.string().optional(),
    skills:z.array(z.string()).optional().default([]),
    hourlyRate:z.number().optional()
})
export const signinSchema = z.object({
    email:z.string().email(),
    password:z.string().min(6)
})