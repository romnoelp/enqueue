import { z } from "zod";

export const addToQueueSchema = z.object({
  purpose: z
    .enum(["payment", "auditing", "clinic", "registrar"])
    .default("payment"),
  email: z.string().email("Invalid email format"),
  timestamp: z.number().default(() => Date.now()),
  customerStatus: z
    .enum(["pending", "ongoing", "complete"])
    .default("pending"),
  stationID: z.string().min(1, "Station ID cannot be empty"),
});

export const addCashierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  activated: z.boolean().default(false),
  type: z
    .enum(["payment", "auditing", "clinic", "registrar"])
    .default("payment"),
});

export const addCounterSchema = z.object({
  counterNumber: z.number().int().positive(),
  employeeUID: z.string().optional(),
});

export const blockEmailSchema = z.object({
  email: z.string().email("Invalid email format"),
  reason: z.string().min(1, "Reason cannot be empty"),
});
