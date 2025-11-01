import { z } from "zod";

export const addStationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  activated: z.boolean().default(false),
  type: z.enum(["payment", "auditing", "clinic", "registrar"]).default("payment"),
});

export type AddStationInput = z.infer<typeof addStationSchema>;
