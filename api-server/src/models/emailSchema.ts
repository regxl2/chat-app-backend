import {z} from "zod";

export const emailSchema = z.object({
    email: z.string().email().refine((email) => email.endsWith("@gmail.com"),"Email must end with '@gmail.com'")
});