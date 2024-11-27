import {z} from "zod";

export const emailPassSchema = z.object({
    email: z.string().email().refine((email)=> email.endsWith("@gmail.com"), "Email must end with '@gmail.com'"),
    password: z.string().min(8, "Invalid password")
})