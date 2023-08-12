import { ApprovalState } from "./approval.model.ts";
import { IModel } from "./model.ts";

export interface IDeployment extends IModel {
  environment: string;
  repository: string;
  installationId: number;
  deploymentId: number;
  creator: {
    login: string;
    url: string;
    avatarUrl: string;
  };
  ref: string;
  runId: number;
  state?: ApprovalState;
}
