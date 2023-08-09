import { z } from "zod";

export const ApprovalWorkflowSchema = z.object({
  name: z.string(),
  on: z.object({
    workflow_dispatch: z.object({
      inputs: z.record(z.object({
        type: z.string()
      }).partial())
    }).partial()
  }).partial()
});

export type ApprovalWorkflow = z.infer<typeof ApprovalWorkflowSchema>;
