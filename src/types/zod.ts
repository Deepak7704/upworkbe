import z, { any } from "zod";
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
export const serveicesSchema = z.object({
    title:z.string(),
    description:z.string(),
    category:z.string(),
    pricing_type:z.enum(['fixed','hourly']),
    price:z.number(),
    delivery_days:z.number()
})
export const projectSchema = z.object({
    title:z.string(),
    description:z.string(),
    category:z.string(),
    budget_min:z.number(),
    budget_max:z.number(),
    deadline:z.date(),
    required_skills:z.array(z.string())
});
export const coverletterSchema = z.object({
    cover_letter:z.string(),
    proposed_price:z.number(),
    estimated_duration:z.number()
});
export const proposalSchema = z.object({
    milestones:z.array(z.object({
        title:z.string(),
        description:z.string().optional().default(""),
        amount: z
          .string()
          .regex(/^\d{1,8}(\.\d{1,2})?$/, "Amount must be DECIMAL(10,2)")
          .transform(Number),
        dueDate:z.string().date()
    })).min(1)
})
