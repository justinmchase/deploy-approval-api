import { mongo } from "grove/mod.ts";
import { IModel } from "./model.ts";

export interface IApprovalGroup extends IModel {
  deploymentId: mongo.ObjectId;
  id: string;
  name: string;
}
