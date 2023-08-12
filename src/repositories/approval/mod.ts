import { mongo, MongoService, NotFoundError } from "grove";
import { ApprovalState, IApproval, User } from "../../models/mod.ts";
import { IApprovalGroup } from "../../models/approval_group.model.ts";

export class ApprovalRepository {
  private readonly approvals: mongo.Collection<IApproval>;
  constructor(mongo: MongoService) {
    this.approvals = mongo.collection<IApproval>("approvals");
  }

  public async create(
    approver: User,
    group: IApprovalGroup,
    state: ApprovalState,
  ) {
    const { _id: approvalGroupId, deploymentId } = group;
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
