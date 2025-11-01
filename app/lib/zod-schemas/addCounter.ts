import { z } from "zod";

export const addCounterSchema = z.object({
  counterNumber: z.number().int().positive(),
  employeeUID: z.string().optional(),
});

export type AddCounterInput = z.infer<typeof addCounterSchema>;
