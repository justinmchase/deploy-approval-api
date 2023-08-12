import { mongo } from "grove";
import { IModel } from "./model.ts";
import { User } from "./user.model.ts";

export type ApprovalState = "approved" | "rejected";

export interface IApproval extends IModel {
  deploymentId: mongo.ObjectId;
  approvalGroupId: mongo.ObjectId;
  approvalGropuName: string;
  approver: User;
  state: ApprovalState;
  reason?: string;
}
