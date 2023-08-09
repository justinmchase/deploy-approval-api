import { mongo, MongoService, NotFoundError } from "grove/mod.ts";
import {
  ApprovalGroupConfig,
  IApprovalGroup,
  IDeployment,
} from "../../models/mod.ts";

export type ApprovalGroupUpsert = {
  deployment: IDeployment;
  group: ApprovalGroupConfig;
};

export class ApprovalGroupRepository {
  private readonly approvalGroups: mongo.Collection<IApprovalGroup>;
  constructor(mongo: MongoService) {
    this.approvalGroups = mongo.collection("approvalGroups");
  }

  public async upsert(info: ApprovalGroupUpsert) {
    const { deployment, group } = info;
    const { _id: deploymentId } = deployment;
    const { id, name } = group;
    const upserted = await this.approvalGroups.findAndModify(
      {
        deploymentId,
        id,
      },
      {
        upsert: true,
        new: true,
        update: {
          $setOnInsert: {
            deploymentId,
            id,
            createdAt: new Date(),
          },
          $set: {
            name,
            updatedAt: new Date(),
          },
        },
      },
    );
    if (!upserted) {
      throw new NotFoundError("IApprovalGroup", `${deploymentId}.${id}`);
    }
    return upserted;
  }
}
