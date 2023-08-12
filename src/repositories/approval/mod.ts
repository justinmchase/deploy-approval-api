import { mongo, MongoService, NotFoundError } from "grove";
import { ApprovalState, IApproval, User } from "../../models/mod.ts";
import { IApprovalGroup } from "../../models/approval_group.model.ts";
import { IDeployment } from "../../models/deployment.model.ts";

export class ApprovalRepository {
  private readonly approvals: mongo.Collection<IApproval>;
  constructor(mongo: MongoService) {
    this.approvals = mongo.collection<IApproval>("approvals");
  }

  public async getFor(approver: User, approvalGroup: IApprovalGroup) {
    return await this.approvals.findOne(
      {
        approvalGroupId: approvalGroup._id,
        "approver.id": approver.id,
      }
    )
  }

  public async getAllFor(deployment: IDeployment) {
    return await this.approvals.find({ deploymentId: deployment._id }).toArray();
  }

  public async create(
    approver: User,
    group: IApprovalGroup,
    state: ApprovalState,
  ) {
    const { _id: approvalGroupId, name: approvalGroupName, deploymentId } = group;
    const approval = await this.approvals.findAndModify(
      {
        deploymentId,
        approvalGroupId,
        "approver.id": approver.id,
      },
      {
        new: true,
        upsert: true,
        update: {
          $setOnInsert: {
            deploymentId,
            approvalGroupId,
            approvalGroupName,
            createdAt: new Date()
          },
          $set: {
            approver,
            state,
            updatedAt: new Date()
          }
        }
      }
    );
    if (!approval) {
      throw new NotFoundError("IApproval", `${deploymentId}.${approvalGroupId}.${approver.id}`);
    }
    return approval;
  }
}
