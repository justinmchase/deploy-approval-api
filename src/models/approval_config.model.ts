import { z } from "zod";

export const ApprovalGroupConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const ApprovalConfigSchema = z.object({
  groups: z.array(ApprovalGroupConfigSchema),
  environments: z.record(z.object({
    groups: z.array(z.string()),
  })),
});

export type ApprovalConfig = z.infer<typeof ApprovalConfigSchema>;
export type ApprovalGroupConfig = z.infer<typeof ApprovalGroupConfigSchema>;
