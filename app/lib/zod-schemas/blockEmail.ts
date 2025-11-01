import { z } from "zod";

export const blockEmailSchema = z.object({
  email: z.string().email("Invalid email format"),
  reason: z.string().min(1, "Reason cannot be empty"),
});

export type BlockEmailInput = z.infer<typeof blockEmailSchema>;
