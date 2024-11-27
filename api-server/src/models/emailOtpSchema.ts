import {z} from "zod";

export const emailOtpSchema = z.object({
    email: z.string().email().refine((email) => email.endsWith("@gmail.com"), "Email must end with '@gmail.com'"),
    code: z.string().length(4, "Invalid OTP"),
})