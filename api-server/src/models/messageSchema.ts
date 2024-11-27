import {z} from "zod";

export const messageSchema = z.object({
    conversationId: z.string(),
    conversationType: z.string(),
    senderId: z.string(),
    content: z.string(),
    contentType: z.string()
});