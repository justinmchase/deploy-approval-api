import { IModel } from "./model.ts";

export interface IDeployment extends IModel {
  environment: string;
  repository: string;
  deploymentId: number;
  ref: string;
}
