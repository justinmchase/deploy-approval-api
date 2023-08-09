import { IModel } from "./model.ts";

export type ApprovalState = "approved" | "rejected";

export interface IApproval extends IModel {
  state: ApprovalState;
  reason?: string;
}
