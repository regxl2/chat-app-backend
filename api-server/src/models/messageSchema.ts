import {z} from "zod";

export const messageSchema = z.object({
    email: z.string(),
    conversationId: z.string(),
    conversationType: z.string(),
    content: z.string(),
    contentType: z.string()
});