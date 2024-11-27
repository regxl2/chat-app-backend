import {z} from "zod";

export const emailNamePassSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email().refine((email: string) => email.endsWith("@gmail.com"), "Email must end with '@gmail.com'"),
    password: z.string().min(8, "Password must be at least 8 characters"),
})

