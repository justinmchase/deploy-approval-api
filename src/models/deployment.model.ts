import { IModel } from "./model.ts";

export interface IDeployment extends IModel {
  environment: string;
  repository: string;
  installationId: number;
  deploymentId: number;
  ref: string;
  runId: number;
}
