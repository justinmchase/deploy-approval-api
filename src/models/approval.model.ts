import { mongo } from "grove/mod.ts";
import { IModel } from "./model.ts";

export type ApprovalState = "approved" | "rejected";

export interface IApproval extends IModel {
  deploymentId: mongo.ObjectId;
  approvalGroupId: mongo.ObjectId;
  state: ApprovalState;
  reason?: string;
}
